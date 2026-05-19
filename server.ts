import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config(); // fallback to .env

async function startServer() {
  const app = express();
  const PORT = 3000;

  // ── /api/fetch-sheet ────────────────────────────────────────────────────────
  app.get('/api/fetch-sheet', async (req, res) => {
    const sheetId   = (req.query.id as string || '').trim();
    const category  = (req.query.category as string || 'FOREX').toUpperCase();
    const weekStart = parseInt(req.query.weekStart as string || '0', 10);
    const weekEnd   = parseInt(req.query.weekEnd   as string || '0', 10);

    if (!sheetId) return res.status(400).json({ error: 'Spreadsheet ID is required' });

    try {
      // ── Build URL ───────────────────────────────────────────────────────────
      let baseUrl = sheetId;
      if (!baseUrl.includes('docs.google.com/spreadsheets')) {
        baseUrl = baseUrl.startsWith('2PACX')
          ? `https://docs.google.com/spreadsheets/d/e/${baseUrl}/pubhtml`
          : `https://docs.google.com/spreadsheets/d/${baseUrl}/pubhtml`;
      }
      if (baseUrl.includes('/edit'))       baseUrl = baseUrl.split('/edit')[0] + '/pubhtml';
      if (baseUrl.includes('single=true')) baseUrl = baseUrl.replace('single=true', 'single=false');

      // ── GID from env ────────────────────────────────────────────────────────
      let rawGid = '';
      if      (category === 'GOLD')    rawGid = process.env.VITE_GID_GOLD    || '';
      else if (category === 'INDICES') rawGid = process.env.VITE_GID_INDICES || '';
      else                             rawGid = process.env.VITE_GID_FOREX   || '';

      const targetGid = (rawGid.match(/\d+/) || [rawGid])[0].trim();

      // ── CSV URL ─────────────────────────────────────────────────────────────
      const pubBase  = baseUrl.split('?')[0].replace('/pubhtml', '/pub');
      const csvQuery = new URLSearchParams({ output: 'csv' });
      if (targetGid) csvQuery.set('gid', targetGid);
      const csvUrl = `${pubBase}?${csvQuery.toString()}`;

      console.log(`[FETCH] ${category} → ${csvUrl}`);

      const csvResp = await fetch(csvUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      });

      if (!csvResp.ok) throw new Error(`Sheet fetch failed (${csvResp.status}). Check sharing settings.`);

      const csvText = await csvResp.text();
      if (csvText.length < 50) throw new Error('Empty sheet response. Verify GID and publish settings.');

      // ── Parse rows ──────────────────────────────────────────────────────────
      // Column layout (0-indexed):
      // 0=#  1=Date  2=Pair  3=Dir  4=Entry  5=Close½  6=Partial/Close
      // 7=Net Pips  8=Loss Pips  9=Trader  10=Wk#  11=Notes  12=Link
      const rawRows = csvText.split(/\r?\n/).filter(r => r.trim());

      const trades = rawRows.map(row => {
        const cols = splitCsvRow(row).map(c => c.replace(/^"|"$/g, '').trim());
        if (cols.length < 10) return null;

        const date    = cols[1] || '';
        const pair    = cols[2] || '';
        const dir     = cols[3] || '';
        const entry   = cols[4] || '';
        const netRaw  = cols[7] || '';
        const lossRaw = cols[8] || '';
        const wkRaw   = cols[10] || '';

        if (!date || !pair) return null;
        if (date.toUpperCase() === 'DATE') return null;
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

        // Some older rows embed direction in pair cell (e.g. "EURAUD  SELL")
        const pairParts = pair.trim().toUpperCase().split(/\s+/);
        const cleanPair = pairParts[0];
        const cleanDir  = dir.trim().toUpperCase() || (pairParts[1] || 'BUY');

        return { date: date.trim(), pair: cleanPair, type: cleanDir, entry: entry.trim(), net, wk };
      }).filter(Boolean) as Array<{ date: string; pair: string; type: string; entry: string; net: number; wk: number }>;

      if (!trades.length) throw new Error('No valid trades found. Check column structure or GID.');

      // ── Week filtering ──────────────────────────────────────────────────────
      const availableWeeks = [...new Set(trades.map(t => t.wk))].sort((a, b) => a - b);
      const latestWeek     = availableWeeks[availableWeeks.length - 1];

      let filtered = trades;
      if (weekStart > 0 && weekEnd >= weekStart) {
        filtered = trades.filter(t => t.wk >= weekStart && t.wk <= weekEnd);
      } else if (weekStart > 0) {
        filtered = trades.filter(t => t.wk === weekStart);
      } else {
        filtered = trades.filter(t => t.wk === latestWeek); // default: latest week
      }

      if (!filtered.length) throw new Error('No trades found for the requested week range.');

      return sendResult(res, filtered, category as string, availableWeeks);

    } catch (err: any) {
      console.error('[ERROR]', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // ── Vite dev / static ───────────────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const dist = path.join(process.cwd(), 'dist');
    app.use(express.static(dist));
    app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => console.log(`Server UP: ${PORT}`));
  }
  return app;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function splitCsvRow(row: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQ = false;
  for (const ch of row) {
    if (ch === '"')             inQ = !inQ;
    else if (ch === ',' && !inQ) { result.push(cur); cur = ''; }
    else                         cur += ch;
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

function sendResult(res: any, trades: any[], category: string, availableWeeks: number[]) {
  trades.sort((a, b) => a.wk !== b.wk ? a.wk - b.wk : parseDate(a.date) - parseDate(b.date));

  const total = trades.reduce((s: number, t: any) => s + t.net, 0);
  const weeks = [...new Set(trades.map((t: any) => t.wk))].sort((a: any, b: any) => a - b) as number[];
  const weekLabel = weeks.length === 1
    ? `Week ${weeks[0]}`
    : `Week ${weeks[0]} – ${weeks[weeks.length - 1]}`;

  res.json({
    trades,
    totalPips: total,
    dateRange: `${trades[0].date} - ${trades[trades.length - 1].date}`,
    weekLabel,
    weeks,
    availableWeeks,
    category,
  });
}

export const appPromise = startServer();
