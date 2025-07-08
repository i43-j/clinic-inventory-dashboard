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
      
      // Handle both array and object responses - n8n returns array format
      const statsData = Array.isArray(data) ? data[0] : data;
      
      return {
        totalProducts: statsData.totalProducts ?? 0,
        expiringBatches: statsData.expiringBatches ?? 0,
        lowStockItems: statsData.lowStockItems ?? 0,
        outOfStockItems: statsData.outOfStockItems ?? 0,
      };
    } else {
      console.error('❌ Dashboard stats API error:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ Dashboard stats fetch failed:', error);
  }

  return { totalProducts: 0, expiringBatches: 0 };
};