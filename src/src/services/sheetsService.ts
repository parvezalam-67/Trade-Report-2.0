import Papa from 'papaparse';
import { TradeRecord, DashboardData, Category } from '../types';

const DEFAULT_SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID || 'https://docs.google.com/spreadsheets/d/e/2PACX-1vREMheZwXROY2GXp3LVG1ywfjXmf0NdK-TRJ5VcB_di-iNwvKP5WeLyubB9p34x8R6iXAIk5bIIzrPu/pubhtml';

// Mock data based on the provided image for initial preview
const MOCK_DATA: TradeRecord[] = [
  { date: 'Mar-2', pair: 'USDCAD', type: 'BUY', entry: '1.36503', net: 34 },
  { date: 'Mar-2', pair: 'EURAUD', type: 'SELL', entry: '1.66071', net: 155 },
  { date: 'Mar-2', pair: 'USDCHF', type: 'BUY', entry: '0.77163', net: 155 },
  { date: 'Mar-2', pair: 'EURAUD', type: 'SELL', entry: '1.65111', net: 69 },
  { date: 'Mar-2', pair: 'USDJPY', type: 'SELL', entry: '157.344', net: 39 },
  { date: 'Mar-3', pair: 'USDCAD', type: 'BUY', entry: '1.36657', net: 35 },
  { date: 'Mar-3', pair: 'AUDCAD', type: 'SELL', entry: '0.97098', net: 180 },
  { date: 'Mar-3', pair: 'NZDUSD', type: 'BUY', entry: '0.58821', net: 68 },
  { date: 'Mar-3', pair: 'USDJPY', type: 'SELL', entry: '157.735', net: 73 },
  { date: 'Mar-3', pair: 'EURUSD', type: 'SELL', entry: '1.15949', net: 36 },
  { date: 'Mar-3', pair: 'AUDCAD', type: 'SELL', entry: '0.97156', net: 155 },
  { date: 'Mar-4', pair: 'USDCAD', type: 'BUY', entry: '1.36676', net: 49 },
  { date: 'Mar-4', pair: 'CADJPY', type: 'SELL', entry: '114.904', net: -71 },
  { date: 'Mar-4', pair: 'EURUSD', type: 'BUY', entry: '1.16359', net: -10 },
  { date: 'Mar-5', pair: 'USDJPY', type: 'SELL', entry: '156.918', net: 33 },
  { date: 'Mar-5', pair: 'GBPNZD', type: 'BUY', entry: '2.25023', net: 35 },
  { date: 'Mar-5', pair: 'AUDCAD', type: 'SELL', entry: '0.96054', net: 36 },
  { date: 'Mar-6', pair: 'GBPNZD', type: 'BUY', entry: '2.26248', net: 155 },
  { date: 'Mar-6', pair: 'NZDUSD', type: 'BUY', entry: '0.58706', net: 33 },
];

export async function fetchSheetData(category: Category = 'FOREX', input = DEFAULT_SPREADSHEET_ID): Promise<DashboardData> {
  const currentId = import.meta.env.VITE_SPREADSHEET_ID || input;
  
  if (!currentId || currentId === 'PASTE_YOUR_ID_HERE') {
    return {
      trades: MOCK_DATA,
      totalPips: MOCK_DATA.reduce((sum, trade) => sum + trade.net, 0),
      dateRange: 'Mar 02 - Mar 06',
      trustpilotRating: 4.5,
      isMock: true,
      category
    };
  }

  try {
    const response = await fetch(`/api/fetch-sheet?id=${encodeURIComponent(currentId)}&category=${category}`);
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const detailedError = errData.error || 'Connection failed';
      throw new Error(`[SERVER ERROR]: ${detailedError}. Check "Published to web" settings.`);
    }
    
    return await response.json();
  } catch (err: any) {
    console.error('Fetch error:', err);
    throw err;
  }
}
