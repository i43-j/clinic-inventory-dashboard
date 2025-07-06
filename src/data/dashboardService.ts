
import { submitToWebhook } from '../utils/webhookSubmission';

export interface DashboardStats {
  totalProducts: number;
  expiringBatches: number;
}

// Cache for dashboard data
let cachedDashboardStats: DashboardStats | null = null;
let lastDashboardFetch = 0;
const DASHBOARD_CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export const fetchDashboardStats = async (forceRefresh = false): Promise<DashboardStats> => {
  const now = Date.now();
  const shouldRefresh = forceRefresh || (now - lastDashboardFetch) > DASHBOARD_CACHE_DURATION;
  
  if (!shouldRefresh && cachedDashboardStats) {
    return cachedDashboardStats;
  }

  try {
    const result = await submitToWebhook({ action: 'get-dashboard-stats' }, 'DASHBOARD_STATS');
    
    if (result.success && result.data) {
      const stats: DashboardStats = {
        totalProducts: result.data.totalProducts || 0,
        expiringBatches: result.data.expiringBatches || 0
      };
      
      cachedDashboardStats = stats;
      lastDashboardFetch = now;
      return stats;
    }
    
    // Fallback to cached data if available
    if (cachedDashboardStats) {
      console.warn('Using cached dashboard stats due to fetch failure');
      return cachedDashboardStats;
    }
    
    // Ultimate fallback
    return getDefaultDashboardStats();
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return cachedDashboardStats || getDefaultDashboardStats();
  }
};

const getDefaultDashboardStats = (): DashboardStats => ({
  totalProducts: 0,
  expiringBatches: 0
});
