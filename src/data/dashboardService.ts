import { DashboardStats } from '../types';

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    console.log('🔄 Fetching dashboard stats via proxy...');
    
    const response = await fetch('https://i43-j.app.n8n.cloud/webhook/dashboard-stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    console.log('📊 Dashboard stats response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('📊 Dashboard stats data received:', data);
      
      return {
        totalProducts: data.totalProducts ?? 0,
        expiringBatches: data.expiringBatches ?? 0,
        lowStockItems: data.lowStockItems ?? 0,
        outOfStockItems: data.outOfStockItems ?? 0,
      };
    } else {
      console.error('❌ Dashboard stats API error:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ Dashboard stats fetch failed:', error);
  }

  return { totalProducts: 0, expiringBatches: 0 };
};