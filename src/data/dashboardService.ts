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

  try {
    const response = await fetch('https://i43-j.app.n8n.cloud/webhook/dashboard-stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    if (response.ok) {
      const data = await response.json();
      cache = {
        totalProducts: data.totalProducts ?? 0,
        expiringBatches: data.expiringBatches ?? 0,
        lowStockItems: data.lowStockItems ?? 0,
        outOfStockItems: data.outOfStockItems ?? 0,
      };
      lastFetch = now;
      return cache;
    }
  } catch (error) {
    console.error('Dashboard stats fetch failed:', error);
  }
  
  return cache ?? { totalProducts: 0, expiringBatches: 0 };
};