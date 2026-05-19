import { useState, useEffect, useCallback } from 'react';
import { DashboardData, Category } from '../types';
import { fetchSheetData } from '../services/sheetsService';

const CACHE_KEY_PREFIX = 'sureshot_dashboard_cache_';

export function useDashboard(activeCategory: Category = 'FOREX') {
  const [dataMap, setDataMap] = useState<Record<Category, DashboardData | null>>(() => {
    const initialState: Record<Category, DashboardData | null> = {
      FOREX: null,
      GOLD: null,
      INDICES: null
    };

    try {
      (['FOREX', 'GOLD', 'INDICES'] as Category[]).forEach(cat => {
        const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${cat}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          const currentId = import.meta.env.VITE_SPREADSHEET_ID;
          // Valid cache check
          if (parsed.sheetId === currentId && parsed.data) {
            initialState[cat] = parsed.data;
          }
        }
      });
    } catch (e) {
      console.error('Cache load failed', e);
    }
    return initialState;
  });

  const [loading, setLoading] = useState(!dataMap[activeCategory]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (category: Category, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      const dashboardData = await fetchSheetData(category);
      
      setDataMap(prev => ({
        ...prev,
        [category]: dashboardData
      }));
      
      localStorage.setItem(`${CACHE_KEY_PREFIX}${category}`, JSON.stringify({
        data: dashboardData,
        sheetId: import.meta.env.VITE_SPREADSHEET_ID,
        timestamp: Date.now()
      }));
      
      setError(null);
    } catch (err) {
      console.error(`[Dashboard Hook Error - ${category}]:`, err);
      setError(`Connection failed for ${category}. Verify spreadsheet tab/ID.`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!dataMap[activeCategory]) {
      loadData(activeCategory);
    }
  }, [activeCategory, loadData, dataMap]);

  return {
    data: dataMap[activeCategory],
    loading,
    refreshing,
    error,
    refresh: () => loadData(activeCategory, true)
  };
}
