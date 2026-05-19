import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const sheetId = ((req.query.id as string) || '').trim();
  const category = ((req.query.category as string) || 'FOREX').toUpperCase();
  const weekStart = parseInt((req.query.weekStart as string) || '0', 10);
  const weekEnd = parseInt((req.query.weekEnd as string) || '0', 10);

  if (!sheetId) return res.status(400).json({ error: 'Spreadsheet ID is required' });

  try {
    let url = sheetId;

    // Remove single=true to support multi-tab GID switching
    if (url.includes('single=true')) {
      url = url.replace('single=true', 'single=false');
    }

    if (!url.includes('docs.google.com/spreadsheets')) {
      if (url.startsWith('2PACX')) {
        url = `https://docs.google.com/spreadsheets/d/e/${url}/pubhtml`;
      } else {
        url = `https://docs.google.com/spreadsheets/d/${url}/pubhtml`;
      }
    }

    if (url.includes('/edit')) {
      url = url.split('/edit')[0] + '/pubhtml';
    }

    // GID Extraction from env secrets with robust defaults
    let rawGid = '';
    if (category === 'GOLD') rawGid = process.env.VITE_GID_GOLD || '367925493';
    else if (category === 'INDICES') rawGid = process.env.VITE_GID_INDICES || '1646006487';
    else rawGid = process.env.VITE_GID_FOREX || '1303016074';

    const targetGid = (rawGid.match(/\d+/) || [rawGid])[0].trim();
    if (targetGid && targetGid !== '') {
      url += (url.includes('?') ? '&' : '?') + `gid=${targetGid}`;
    }

    const fetchOptions: RequestInit = {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    };

    // 1. Try CSV Fetch (Highest Reliability)
    const baseCsvUrl = url.split('?')[0].replace('/pubhtml', '/pub');
    const params = new URLSearchParams(url.split('?')[1] || '');
    params.set('output', 'csv');
    const csvUrl = `${baseCsvUrl}?${params.toString()}`;

    console.log(`[FETCH] Trying CSV for ${category}: ${csvUrl}`);
    const csvResp = await fetch(csvUrl, fetchOptions);

    if (csvResp.ok) {
      const csvText = await csvResp.text();
      if (csvText.length > 100) {
        const rawRows = csvText.split(/\r?\n/).filter(r => r.trim());
        const trades = rawRows.map(row => {
          const cols = splitCsvRow(row).map(c => c.replace(/^"|"$/g, '').trim());
          if (cols.length < 10) return null;

          const date = cols[1] || '';
          const pair = cols[2] || '';
          const dir = cols[3] || '';
          const entry = cols[4] || '';
          const netRaw = cols[7] || '';
          const lossRaw = cols[8] || '';
          const wkRaw = cols[10] || '';

          if (!date || !pair) return null;
          if (date.toUpperCase() === 'DATE' || date.toUpperCase().includes('DATE')) return null;
          if (pair.toUpperCase().includes('TRADE LOG')) return null;
          if (pair.toUpperCase().includes('PAIR')) return null;
          if ((cols[5] || '').toUpperCase().includes('INVALID')) return null;
          if ((cols[6] || '').toUpperCase().includes('INVALID')) return null;

          const wk = parseInt(wkRaw.replace(/\D/g, ''), 10);
          if (isNaN(wk) || wk === 0) return null;

          let net = parseFloat(netRaw.replace(/[^0-9.-]/g, ''));
          const loss = parseFloat(lossRaw.replace(/[^0-9.-]/g, ''));
          if (isNaN(net) || net === 0) {
            if (!isNaN(loss) && loss !== 0) net = -Math.abs(loss);
            else return null;
          }

          const pairParts = pair.trim().toUpperCase().split(/\s+/);
          const cleanPair = pairParts[0];
          const cleanDir = dir.trim().toUpperCase() || (pairParts[1] || 'BUY');

          return { date: date.trim(), pair: cleanPair, type: cleanDir, entry: entry.trim(), net, wk };
        }).filter(Boolean) as Array<{ date: string; pair: string; type: string; entry: string; net: number; wk: number }>;

        if (trades.length > 0) {
          const availableWeeks = [...new Set(trades.map(t => t.wk))].sort((a, b) => a - b);
          const latestWeek = availableWeeks[availableWeeks.length - 1] || 0;

          let filtered = trades;
          if (weekStart > 0 && weekEnd >= weekStart) {
            filtered = trades.filter(t => t.wk >= weekStart && t.wk <= weekEnd);
          } else if (weekStart > 0) {
            filtered = trades.filter(t => t.wk === weekStart);
          } else {
            filtered = trades.filter(t => t.wk === latestWeek); // default: latest week
          }

          return sendResult(res, filtered, category, availableWeeks);
        }
      }
    }

    throw new Error('No valid trades found in sheet. Verify your ID and sharing settings.');
  } catch (err: any) {
    console.error('[ERROR]', err.message);
    return res.status(500).json({ error: err.message });
  }
}

function splitCsvRow(row: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQ = false;
  for (const ch of row) {
    if (ch === '"') inQ = !inQ;
    else if (ch === ',' && !inQ) { result.push(cur); cur = ''; }
    else cur += ch;
  }
  result.push(cur);
  return result;
}

const MONTHS: Record<string, number> = {
  JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
  JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
};

function parseDate(d: string): number {
  const parts = d.replace(/,/g, '').split(/[-\s/]+/);
  if (parts.length < 2) return 0;
  const ms = parts[0].toUpperCase().substring(0, 3);
  return (MONTHS[ms] ?? 0) * 100 + (parseInt(parts[1] || '0', 10));
}

function sendResult(res: VercelResponse, trades: any[], category: string, availableWeeks: number[]) {
  trades.sort((a, b) => a.wk !== b.wk ? a.wk - b.wk : parseDate(a.date) - parseDate(b.date));

  const total = trades.reduce((s: number, t: any) => s + t.net, 0);
  const weeks = [...new Set(trades.map((t: any) => t.wk))].sort((a: any, b: any) => a - b) as number[];

  const weekLabel = weeks.length === 1
    ? `Week ${weeks[0]}`
    : weeks.length > 1
      ? `Week ${weeks[0]} – ${weeks[weeks.length - 1]}`
      : 'This Week';

  return res.json({
    trades,
    totalPips: total,
    dateRange: trades.length ? `${trades[0].date} - ${trades[trades.length - 1].date}` : '—',
    weekLabel,
    weeks,
    availableWeeks,
    category,
    trustpilotRating: 4.7,
    isMock: false,
  });
}
