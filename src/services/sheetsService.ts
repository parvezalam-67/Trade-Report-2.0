import { TradeRecord, DashboardData, Category, WeekFilter } from '../types';

const DEFAULT_SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID ||
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTRv65wBC3kOdWImBSZmJJ5062ofRHKXoo0duDssF91Q5f0Rnz4c8QvvcVuKM2_xr6Agq3iomCY8Peo/pubhtml';

// Mock data matching the new column structure
const MOCK_DATA: TradeRecord[] = [
  { date: 'Apr-6',  pair: 'GBPUSD', type: 'SELL', entry: '1.32089', net:  70, wk: 15 },
  { date: 'Apr-6',  pair: 'USDCHF', type: 'BUY',  entry: '0.80067', net:  69, wk: 15 },
  { date: 'Apr-7',  pair: 'USDJPY', type: 'BUY',  entry: '159.53',  net:  33, wk: 15 },
  { date: 'Apr-7',  pair: 'GBPJPY', type: 'BUY',  entry: '211.723', net: 156, wk: 15 },
  { date: 'Apr-7',  pair: 'EURUSD', type: 'SELL',  entry: '1.15761', net:  70, wk: 15 },
  { date: 'Apr-8',  pair: 'EURUSD', type: 'BUY',  entry: '1.16857', net:  34, wk: 15 },
  { date: 'Apr-8',  pair: 'EURJPY', type: 'BUY',  entry: '185.071', net: 155, wk: 15 },
  { date: 'Apr-9',  pair: 'GBPUSD', type: 'BUY',  entry: '1.34048', net:  68, wk: 15 },
  { date: 'Apr-9',  pair: 'USDCAD', type: 'SELL', entry: '1.38121', net: 173, wk: 15 },
  { date: 'Apr-10', pair: 'GBPNZD', type: 'BUY',  entry: '2.29874', net:  70, wk: 15 },
];

export async function fetchSheetData(
  category: Category = 'FOREX',
  filter: WeekFilter = { weekStart: 0, weekEnd: 0 },
  input = DEFAULT_SPREADSHEET_ID
): Promise<DashboardData> {
  const currentId = import.meta.env.VITE_SPREADSHEET_ID || input;

  if (!currentId || currentId === 'PASTE_YOUR_ID_HERE') {
    const total = MOCK_DATA.reduce((sum, t) => sum + t.net, 0);
    return {
      trades: MOCK_DATA,
      totalPips: total,
      dateRange: 'Apr-6 - Apr-10',
      weekLabel: 'Week 15',
      weeks: [15],
      availableWeeks: [15],
      trustpilotRating: 4.5,
      isMock: true,
      category,
    };
  }

  const params = new URLSearchParams({
    id: currentId,
    category,
  });
  if (filter.weekStart > 0) params.set('weekStart', String(filter.weekStart));
  if (filter.weekEnd   > 0) params.set('weekEnd',   String(filter.weekEnd));

  const response = await fetch(`/api/fetch-sheet?${params.toString()}`);
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Connection failed. Check spreadsheet settings.');
  }

  return response.json();
}
