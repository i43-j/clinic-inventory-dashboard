export interface Product {
  id: string;
  name: string;
  description?: string;
}

export interface Batch {
  id: string;
  productId: string;
  productName: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  location?: string;
}

export interface StockLevel {
  productId: string;
  productName: string;
  currentStock: number;
  minimumStock: number;
  status?: 'low' | 'normal' | 'out';
}

export interface DashboardStats {
  totalProducts: number;
  expiringBatches: number;
  lowStockItems?: number;
  outOfStockItems?: number;
}