import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const sheetId = ((req.query.id as string) || '').trim();
  const category = ((req.query.category as string) || 'FOREX').toUpperCase();

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

    // GID Extraction from env secrets
    let rawGid = '';
    if (category === 'GOLD') rawGid = process.env.VITE_GID_GOLD || '';
    else if (category === 'INDICES') rawGid = process.env.VITE_GID_INDICES || '';
    else rawGid = process.env.VITE_GID_FOREX || '';

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
        const csvRows = csvText
          .split(/\r?\n/)
          .filter((r) => r.trim())
          .map((r) => r.split(','));
        const trades = csvRows
          .map((row) => {
            if (row.length < 5) return null;
            const cols = row.map((c) => c.replace(/"/g, '').trim());
            const [date, pair, type, entry, net] = cols;
            const loss = cols.length >= 6 ? cols[5] : '';
            const wkRaw = cols.length >= 7 ? cols[6] : '';
            const wk = parseInt(wkRaw.replace(/[^0-9]/g, ''), 10) || 0;

            let v = parseInt(net.replace(/[^0-9-]/g, ''), 10);
            const lv = parseInt(loss.replace(/[^0-9-]/g, ''), 10);
            if (isNaN(v) || v === 0) {
              if (!isNaN(lv) && lv !== 0) v = -Math.abs(lv);
              else return null;
            }
            if (!date || !pair || date.toUpperCase() === 'DATE' || pair.toUpperCase() === 'PAIR')
              return null;
            return { date, pair, entry, net: v, type: type.toUpperCase(), wk };
          })
          .filter(Boolean);

        if (trades.length > 0) {
          return sendResult(res, trades as any[], category);
        }
      }
    }

    // 2. Fallback: try HTML parsing with built-in DOMParser-compatible approach
    console.log(`[FETCH] Falling back to HTML for ${category}: ${url}`);
    const htmlResp = await fetch(url, fetchOptions);
    const html = await htmlResp.text();

    if (html.includes('google-signin-frame')) {
      throw new Error('Sheet is Private. Set sharing to Public → Entire Document.');
    }

    // Simple regex-based table extraction (no jsdom dependency needed on Vercel)
    const tableMatch = html.match(/<table[^>]*>([\s\S]*?)<\/table>/gi);
    if (!tableMatch) throw new Error('Data table not found.');

    const trMatches = tableMatch[0].match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
    const trades = trMatches
      .map((tr) => {
        const tds = (tr.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || []).map((td) =>
          td.replace(/<[^>]+>/g, '').trim()
        );
        if (tds.length < 5) return null;
        const [date, pair, type, entry, net] = tds;
        const loss = tds.length >= 6 ? tds[5] : '';
        const wkRaw = tds.length >= 7 ? tds[6] : '';
        const wk = parseInt(wkRaw.replace(/[^0-9]/g, ''), 10) || 0;
        let v = parseInt(net.replace(/[^0-9-]/g, ''), 10);
        const lv = parseInt(loss.replace(/[^0-9-]/g, ''), 10);
        if (isNaN(v) || v === 0) {
          if (!isNaN(lv) && lv !== 0) v = -Math.abs(lv);
          else return null;
        }
        if (!date || !pair || date.toUpperCase() === 'DATE' || pair.toUpperCase() === 'PAIR')
          return null;
        return { date, pair, entry, net: v, type: type.toUpperCase(), wk };
      })
      .filter(Boolean);

    if (!trades.length) throw new Error('No valid trades found in sheet.');
    return sendResult(res, trades as any[], category);
  } catch (err: any) {
    console.error('[ERROR]', err.message);
    return res.status(500).json({ error: err.message });
  }
}

function sendResult(res: VercelResponse, trades: any[], category: string) {
  trades.sort((a, b) => {
    const p = (s: string) => {
      const parts = s.replace(/,/g, '').split(/[-\s/]+/);
      if (parts.length < 2) return 0;
      const m: any = {
        JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
        JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
      };
      const ms = parts[0].toUpperCase().substring(0, 3);
      return (m[ms] || 0) * 100 + (parseInt(parts[1], 10) || 0);
    };
    return p(a.date) - p(b.date);
  });

  const total = trades.reduce((s: number, t: any) => s + t.net, 0);

  // Build sorted unique week list from wk column
  const weekSet = new Set<number>();
  trades.forEach((t: any) => { if (t.wk > 0) weekSet.add(t.wk); });
  const availableWeeks = Array.from(weekSet).sort((a, b) => a - b);
  const weeks = availableWeeks;
  const latestWk = availableWeeks.length ? availableWeeks[availableWeeks.length - 1] : 0;
  const weekLabel = latestWk > 0 ? `Week ${latestWk}` : 'This Week';

  return res.json({
    trades,
    totalPips: total,
    dateRange: `${trades[0].date} - ${trades[trades.length - 1].date}`,
    category,
    availableWeeks,
    weeks,
    weekLabel,
    trustpilotRating: 4.7,
    isMock: false,
  });
}
