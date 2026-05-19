export interface TradeRecord {
  date: string;
  pair: string;
  type: 'BUY' | 'SELL';
  entry: string;
  net: number;
}

export interface DashboardData {
  trades: TradeRecord[];
  totalPips: number;
  dateRange: string;
  isMock?: boolean;
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}
