import { submitToWebhook } from '../utils/webhookSubmission';

export interface DashboardStats {
  totalProducts: number;
  expiringBatches: number;
  lowStockItems?: number;
  outOfStockItems?: number;
}

let cache: DashboardStats | null = null;
let lastFetch = 0;
const CACHE_MS = 60 * 60 * 1000; // 1 hour

export const fetchDashboardStats = async (
  force = false,
): Promise<DashboardStats> => {
  const now = Date.now();
  if (!force && cache && now - lastFetch < CACHE_MS) return cache;

  const res = await submitToWebhook(null, 'DASHBOARD_STATS');
  if (res.success && res.data) {
    cache = {
      totalProducts: res.data.totalProducts ?? 0,
      expiringBatches: res.data.expiringBatches ?? 0,
      lowStockItems: res.data.lowStockItems ?? 0,
      outOfStockItems: res.data.outOfStockItems ?? 0,
    };
    lastFetch = now;
    return cache;
  }
  return cache ?? { totalProducts: 0, expiringBatches: 0 };
};
