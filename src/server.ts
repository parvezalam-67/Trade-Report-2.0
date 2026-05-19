import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { JSDOM } from 'jsdom';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.get('/api/fetch-sheet', async (req, res) => {
    const sheetId = (req.query.id as string || '').trim();
    const category = (req.query.category as string || 'FOREX').toUpperCase();
    
    if (!sheetId) return res.status(400).json({ error: 'Spreadsheet ID is required' });

    try {
      let url = sheetId;
      
      // Unlock: Remove single=true to support multi-tab GID switching
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

      // GID Extraction from secrets
      let rawGid = '';
      if (category === 'GOLD') rawGid = process.env.VITE_GID_GOLD || '';
      else if (category === 'INDICES') rawGid = process.env.VITE_GID_INDICES || '';
      else rawGid = process.env.VITE_GID_FOREX || '';

      const targetGid = (rawGid.match(/\d+/) || [rawGid])[0].trim();
      if (targetGid && targetGid !== '') {
        url += (url.includes('?') ? '&' : '?') + `gid=${targetGid}`;
      }

      const fetchOptions = {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
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
          const csvRows = csvText.split(/\r?\n/).filter(r => r.trim()).map(r => r.split(','));
          const trades = csvRows.map(row => {
            if (row.length < 5) return null;
            const cols = row.map(c => c.replace(/"/g, '').trim());
            const [date, pair, type, entry, net] = cols;
            const loss = cols.length >= 6 ? cols[5] : '';
            
            let v = parseInt(net.replace(/[^0-9-]/g, ''), 10);
            const lv = parseInt(loss.replace(/[^0-9-]/g, ''), 10);
            if (isNaN(v) || v === 0) {
              if (!isNaN(lv) && lv !== 0) v = -Math.abs(lv);
              else return null;
            }
            if (!date || !pair || date.toUpperCase() === 'DATE' || pair.toUpperCase() === 'PAIR') return null;
            return { date, pair, entry, net: v, type: type.toUpperCase() };
          }).filter(Boolean);
          
          if (trades.length > 0) return sendResult(req, res, trades as any[]);
        }
      }

      // 2. Fallback to HTML Scraping
      console.log(`[FETCH] Falling back to HTML for ${category}: ${url}`);
      const response = await fetch(url, fetchOptions);
      const html = await response.text();
      if (html.includes('google-signin-frame')) throw new Error('Sheet is Private. Set to Public -> Entire Document.');

      const dom = new JSDOM(html);
      const doc = dom.window.document;
      const tables = Array.from(doc.querySelectorAll('table, .waffle'));
      let table = tables.find(t => t.textContent?.toUpperCase().includes('BUY')) || tables[0];
      if (!table) throw new Error('Data table not found.');

      const style = Array.from(doc.querySelectorAll('style')).map(s => s.textContent).join(' ');
      const redClasses: string[] = [];
      const redRegex = /\.([a-z0-9]+)\s*\{[^}]*color:\s*(?:#f00|#ff0000|red|#cc4125|#ff4444)[^}]*\}/gi;
      let m; while ((m = redRegex.exec(style)) !== null) redClasses.push(m[1]);

      const trades = Array.from(table.querySelectorAll('tr')).map(tr => {
        const tds = Array.from(tr.querySelectorAll('td'));
        if (tds.length < 5) return null;
        const [d, p, t, e, n] = tds.map(td => td.textContent?.trim() || '');
        const l = tds.length >= 6 ? tds[5].textContent?.trim() || '' : '';
        let v = parseInt(n.replace(/[^0-9-]/g, ''), 10);
        const lv = parseInt(l.replace(/[^0-9-]/g, ''), 10);
        if (isNaN(v) || v === 0) {
          if (!isNaN(lv) && lv !== 0) v = -Math.abs(lv);
          else return null;
        }
        if (redClasses.some(c => tds[4].classList.contains(c)) && v > 0) v = -v;
        return { date: d, pair: p, entry: e, net: v, type: t.toUpperCase() };
      }).filter(t => t && t.pair.length > 1 && t.pair.toUpperCase() !== 'PAIR');

      if (!trades.length) throw new Error('No valid trades found in sheet.');
      sendResult(req, res, trades as any[]);

    } catch (err: any) {
      console.error('[ERROR]', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  function sendResult(req: any, res: any, trades: any[]) {
    trades.sort((a, b) => {
      const p = (s: string) => {
        const parts = s.replace(/,/g, '').split(/[-\s/]+/);
        if (parts.length < 2) return 0;
        const m: any = { 'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5, 'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11 };
        const ms = parts[0].toUpperCase().substring(0, 3);
        return (m[ms] || 0) * 100 + (parseInt(parts[1], 10) || 0);
      };
      return p(a.date) - p(b.date);
    });
    const total = trades.reduce((s, t) => s + t.net, 0);
    res.json({ trades, totalPips: total, dateRange: `${trades[0].date} - ${trades[trades.length-1].date}`, category: req.query.category });
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const dist = path.join(process.cwd(), 'dist');
    app.use(express.static(dist));
    app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => console.log(`Server UP: 3000`));
  }
  return app;
}

export const appPromise = startServer();
