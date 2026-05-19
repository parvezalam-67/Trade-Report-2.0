export type Category = 'FOREX' | 'GOLD' | 'INDICES';

export interface TradeRecord {
  date: string;
  pair: string;
  type: string;
  entry: string;
  net: number;
  wk: number;  // Week number from the "Wk #" column
}

export interface DashboardData {
  trades: TradeRecord[];
  totalPips: number;
  dateRange: string;
  weekLabel: string;        // e.g. "Week 17" or "Week 15 – 17"
  weeks: number[];          // weeks present in this result
  availableWeeks: number[]; // all weeks available in the full sheet
  trustpilotRating: number;
  isMock: boolean;
  category?: Category;
}

export interface WeekFilter {
  weekStart: number; // 0 = latest week (default)
  weekEnd: number;   // 0 = same as weekStart
}
