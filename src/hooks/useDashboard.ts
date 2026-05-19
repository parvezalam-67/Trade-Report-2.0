import { useState, useEffect, useCallback } from 'react';
import { DashboardData, Category, WeekFilter } from '../types';
import { fetchSheetData } from '../services/sheetsService';

const CACHE_KEY_PREFIX = 'sureshot_dashboard_cache_';

export function useDashboard(
  activeCategory: Category = 'FOREX',
  weekFilter: WeekFilter = { weekStart: 0, weekEnd: 0 }
) {
  const cacheKey = `${CACHE_KEY_PREFIX}${activeCategory}_${weekFilter.weekStart}_${weekFilter.weekEnd}`;

  const [dataMap, setDataMap] = useState<Record<string, DashboardData | null>>({});
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Try hydrating from cache on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        const currentId = import.meta.env.VITE_SPREADSHEET_ID;
        if (parsed.sheetId === currentId && parsed.data) {
          setDataMap(prev => ({ ...prev, [cacheKey]: parsed.data }));
          setLoading(false);
        }
      }
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const dashboardData = await fetchSheetData(activeCategory, weekFilter);

      setDataMap(prev => ({ ...prev, [cacheKey]: dashboardData }));

      localStorage.setItem(cacheKey, JSON.stringify({
        data: dashboardData,
        sheetId: import.meta.env.VITE_SPREADSHEET_ID,
        timestamp: Date.now(),
      }));

      setError(null);
    } catch (err: any) {
      console.error(`[Dashboard Hook Error - ${activeCategory}]:`, err);
      setError(err.message || `Connection failed for ${activeCategory}.`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeCategory, weekFilter, cacheKey]);

  // Fetch whenever category or filter changes and we don't have cached data
  useEffect(() => {
    if (!dataMap[cacheKey]) {
      loadData();
    }
  }, [cacheKey, dataMap, loadData]);

  return {
    data:      dataMap[cacheKey] ?? null,
    loading,
    refreshing,
    error,
    refresh:   () => loadData(true),
  };
}
