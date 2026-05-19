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
    // ── Build pubhtml base URL ────────────────────────────────────────────────
    let baseUrl = sheetId;

    if (!baseUrl.includes('docs.google.com/spreadsheets')) {
      baseUrl = baseUrl.startsWith('2PACX')
        ? `https://docs.google.com/spreadsheets/d/e/${baseUrl}/pubhtml`
        : `https://docs.google.com/spreadsheets/d/${baseUrl}/pubhtml`;
    }
    if (baseUrl.includes('/edit')) baseUrl = baseUrl.split('/edit')[0] + '/pubhtml';
    if (baseUrl.includes('single=true')) baseUrl = baseUrl.replace('single=true', 'single=false');

    // ── Resolve GID from env with robust defaults ────────────────────────────
    let rawGid = '';
    if (category === 'GOLD') rawGid = process.env.VITE_GID_GOLD || '367925493';
    else if (category === 'INDICES') rawGid = process.env.VITE_GID_INDICES || '1646006487';
    else rawGid = process.env.VITE_GID_FOREX || '1303016074';

    const targetGid = (rawGid.match(/\d+/) || [rawGid])[0].trim();

    // ── Build CSV URL ────────────────────────────────────────────────────────
    const pubBase = baseUrl.split('?')[0].replace('/pubhtml', '/pub');
    const csvQuery = new URLSearchParams({ output: 'csv' });
    if (targetGid) csvQuery.set('gid', targetGid);
    const csvUrl = `${pubBase}?${csvQuery.toString()}`;

    const fetchOptions: RequestInit = {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    };

    console.log(`[FETCH] ${category}: ${csvUrl}`);
    const csvResp = await fetch(csvUrl, fetchOptions);

    if (!csvResp.ok) {
      throw new Error(`Sheet fetch failed (${csvResp.status}). Check "Publish to web" settings.`);
    }

    const csvText = await csvResp.text();
    if (csvText.length < 50) {
      throw new Error('Empty response. Verify the sheet is published and GID is correct.');
    }

    // ── Parse rows ────────────────────────────────────────────────────────────
    // New column layout (0-indexed):
    // 0=#  1=Date  2=Pair  3=Dir  4=Entry  5=Close½  6=Partial/Close
    // 7=Net Pips  8=Loss Pips  9=Trader  10=Wk#  11=Notes  12=Link
    const rawRows = csvText.split(/\r?\n/).filter(r => r.trim());

    const trades = rawRows
      .map(row => {
        const cols = splitCsvRow(row).map(c => c.replace(/^"|"$/g, '').trim());
        if (cols.length < 10) return null;

        const date = cols[1] || '';
        const pair = cols[2] || '';
        const dir = cols[3] || '';
        const entry = cols[4] || '';
        const netRaw = cols[7] || '';
        const lossRaw = cols[8] || '';
        const wkRaw = cols[10] || '';

        // Skip header / title / empty rows
        if (!date || !pair) return null;
        if (date.toUpperCase() === 'DATE') return null;
        if (pair.toUpperCase().includes('TRADE LOG')) return null;
        if (pair.toUpperCase().includes('PAIR')) return null;

        // Skip "INVALID PARAMETERS" sentinel rows
        if (cols[5]?.toUpperCase().includes('INVALID')) return null;
        if (cols[6]?.toUpperCase().includes('INVALID')) return null;

        // Parse week number
        const wk = parseInt(wkRaw.replace(/\D/g, ''), 10);
        if (isNaN(wk) || wk === 0) return null;

        // Net pips: prefer col 7 (Net Pips), fall back to negative col 8 (Loss Pips)
        let net = parseFloat(netRaw.replace(/[^0-9.-]/g, ''));
        const loss = parseFloat(lossRaw.replace(/[^0-9.-]/g, ''));
        if (isNaN(net) || net === 0) {
          if (!isNaN(loss) && loss !== 0) net = -Math.abs(loss);
          else return null;
        }

        return {
          date: date.trim(),
          pair: pair.trim().toUpperCase().split(/\s+/)[0], // strip any embedded dir
          type: dir.trim().toUpperCase() || 'BUY',
          entry: entry.trim(),
          net,
          wk,
        };
      })
      .filter(Boolean) as Array<{
        date: string; pair: string; type: string;
        entry: string; net: number; wk: number;
      }>;

    if (!trades.length) {
      throw new Error('No valid trades found. Check column structure or GID.');
    }

    // ── Week filtering ────────────────────────────────────────────────────────
    const availableWeeks = [...new Set(trades.map(t => t.wk))].sort((a, b) => a - b);
    const latestWeek = availableWeeks[availableWeeks.length - 1];

    let filtered = trades;
    if (weekStart > 0 && weekEnd >= weekStart) {
      filtered = trades.filter(t => t.wk >= weekStart && t.wk <= weekEnd);
    } else if (weekStart > 0) {
      filtered = trades.filter(t => t.wk === weekStart);
    } else {
      filtered = trades.filter(t => t.wk === latestWeek);
    }

    if (!filtered.length) {
      throw new Error(`No trades found for the requested week range.`);
    }

    return sendResult(res, filtered, category, availableWeeks);

  } catch (err: any) {
    console.error('[ERROR]', err.message);
    return res.status(500).json({ error: err.message });
  }
}

// ─────────────────────────────────────────────────────────────────────────────

/** RFC-compliant CSV row splitter (handles quoted commas). */
function splitCsvRow(row: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQ = false;
  for (const ch of row) {
    if (ch === '"') { inQ = !inQ; }
    else if (ch === ',' && !inQ) { result.push(cur); cur = ''; }
    else { cur += ch; }
  }
  result.push(cur);
  return result;
}

const MONTHS: Record<string, number> = {
  JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
  JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
};

function parseDate(d: string): number {
  const [mon, day] = d.split('-');
  return (MONTHS[(mon || '').toUpperCase().substring(0, 3)] ?? 0) * 100 + (parseInt(day || '0', 10));
}

function sendResult(
  res: VercelResponse,
  trades: Array<{ date: string; pair: string; type: string; entry: string; net: number; wk: number }>,
  category: string,
  availableWeeks: number[]
) {
  // Sort by week, then by calendar date within week
  trades.sort((a, b) => a.wk !== b.wk ? a.wk - b.wk : parseDate(a.date) - parseDate(b.date));

  const total = trades.reduce((s, t) => s + t.net, 0);
  const weeks = [...new Set(trades.map(t => t.wk))].sort((a, b) => a - b);
  const weekLabel = weeks.length === 1
    ? `Week ${weeks[0]}`
    : `Week ${weeks[0]} – ${weeks[weeks.length - 1]}`;

  return res.json({
    trades,
    totalPips: total,
    dateRange: `${trades[0].date} - ${trades[trades.length - 1].date}`,
    weekLabel,               // e.g. "Week 17" or "Week 15 – 17"
    weeks,                   // weeks in this result
    availableWeeks,          // ALL weeks in the sheet (for the UI selector)
    category,
  });
}
