export type Category = 'FOREX' | 'GOLD' | 'INDICES';

export interface TradeRecord {
  date: string;
  pair: string;
  type: string;
  entry: string;
  net: number;
}

export interface DashboardData {
  trades: TradeRecord[];
  totalPips: number;
  dateRange: string;
  trustpilotRating: number;
  isMock: boolean;
  category?: Category;
}
