// hooks/useLiveData.ts - Custom React hooks for live data
import { useState, useEffect, useCallback } from 'react';
import { 
  getLiveData, 
  fetchStockLevels, 
  addLiveProduct, 
  addLiveBatch, 
  updateLiveStock,
  Product, 
  Batch, 
  StockLevel 
} from '../services/liveData';

export interface LiveDataState {
  products: Product[];
  batches: Batch[];
  stockLevels: StockLevel[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export const useLiveData = (autoRefresh = true, refreshInterval = 5 * 60 * 1000) => {
  const [state, setState] = useState<LiveDataState>({
    products: [],
    batches: [],
    stockLevels: [],
    loading: true,
    error: null,
    lastUpdated: null
  });

  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const [liveData, stockLevels] = await Promise.all([
        getLiveData(forceRefresh),
        fetchStockLevels()
      ]);
      
      setState({
        products: liveData.products,
        batches: liveData.batches,
        stockLevels,
        loading: false,
        error: null,
        lastUpdated: new Date()
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch data'
      }));
    }
  }, []);

  const refreshData = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  const addProduct = useCallback(async (product: Omit<Product, 'id'>) => {
    const success = await addLiveProduct(product);
    if (success) {
      await fetchData(true); // Refresh data after adding
    }
    return success;
  }, [fetchData]);

  const addBatch = useCallback(async (batch: Omit<Batch, 'id'>) => {
    const success = await addLiveBatch(batch);
    if (success) {
      await fetchData(true);
    }
    return success;
  }, [fetchData]);

  const updateStock = useCallback(async (productId: string, newStock: number) => {
    const success = await updateLiveStock(productId, newStock);
    if (success) {
      await fetchData(true);
    }
    return success;
  }, [fetchData]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData]);

  return {
    ...state,
    refreshData,
    addProduct,
    addBatch,
    updateStock
  };
};

// Hook specifically for products
export const useProducts = () => {
  const { products, loading, error, refreshData, addProduct } = useLiveData();
  
  const getProductById = useCallback((id: string) => {
    return products.find(p => p.id === id);
  }, [products]);

  const getProductByName = useCallback((name: string) => {
    return products.find(p => p.name.toLowerCase().includes(name.toLowerCase()));
  }, [products]);

  return {
    products,
    loading,
    error,
    refreshData,
    addProduct,
    getProductById,
    getProductByName
  };
};

// Hook specifically for batches
export const useBatches = () => {
  const { batches, loading, error, refreshData, addBatch } = useLiveData();
  
  const getBatchesByProduct = useCallback((productId: string) => {
    return batches.filter(b => b.productId === productId);
  }, [batches]);

  const getExpiringBatches = useCallback((days: number = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);
    
    return batches.filter(batch => {
      const expiryDate = new Date(batch.expiryDate);
      return expiryDate <= cutoffDate;
    });
  }, [batches]);

  const getExpiredBatches = useCallback(() => {
    const today = new Date();
    return batches.filter(batch => {
      const expiryDate = new Date(batch.expiryDate);
      return expiryDate < today;
    });
  }, [batches]);

  return {
    batches,
    loading,
    error,
    refreshData,
    addBatch,
    getBatchesByProduct,
    getExpiringBatches,
    getExpiredBatches
  };
};

// Hook for stock levels
export const useStockLevels = () => {
  const { stockLevels, loading, error, refreshData, updateStock } = useLiveData();
  
  const getStockLevel = useCallback((productId: string) => {
    return stockLevels.find(s => s.productId === productId);
  }, [stockLevels]);

  const getLowStockItems = useCallback(() => {
    return stockLevels.filter(stock => stock.currentStock <= stock.minimumStock);
  }, [stockLevels]);

  const getOutOfStockItems = useCallback(() => {
    return stockLevels.filter(stock => stock.currentStock === 0);
  }, [stockLevels]);

  return {
    stockLevels,
    loading,
    error,
    refreshData,
    updateStock,
    getStockLevel,
    getLowStockItems,
    getOutOfStockItems
  };
};
