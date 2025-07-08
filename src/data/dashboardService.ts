export interface DashboardStats {
  totalProducts: number;
  expiringBatches: number;
  lowStockItems?: number;
  outOfStockItems?: number;
}

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await fetch('https://i43-j.app.n8n.cloud/webhook/dashboard-stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    if (response.ok) {
      const data = await response.json();
      return {
        totalProducts: data.totalProducts ?? 0,
        expiringBatches: data.expiringBatches ?? 0,
        lowStockItems: data.lowStockItems ?? 0,
        outOfStockItems: data.outOfStockItems ?? 0,
      };
    }
  } catch (error) {
    console.error('Dashboard stats fetch failed:', error);
  }

  return { totalProducts: 0, expiringBatches: 0 };
};