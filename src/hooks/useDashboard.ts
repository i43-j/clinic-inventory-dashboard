
import { useState, useEffect, useCallback } from 'react';
import { fetchDashboardStats, DashboardStats } from '../data/dashboardService';

export interface DashboardState {
  stats: DashboardStats;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export const useDashboard = (autoRefresh = true, refreshInterval = 60 * 60 * 1000) => {
  const [state, setState] = useState<DashboardState>({
    stats: { totalProducts: 0, expiringBatches: 0 },
    loading: true,
    error: null,
    lastUpdated: null
  });

  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const stats = await fetchDashboardStats(forceRefresh);
      
      setState({
        stats,
        loading: false,
        error: null,
        lastUpdated: new Date()
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch dashboard data'
      }));
    }
  }, []);

  const refreshData = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh setup (every hour)
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData]);

  return {
    ...state,
    refreshData
  };
};
