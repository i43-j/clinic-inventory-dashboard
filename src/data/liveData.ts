// liveData.ts - Replace your mockData.ts with this
import { submitToWebhook } from '../utils/webhookSubmission';

export interface Product {
  id: string;
  name: string;
}

export interface Batch {
  id: string;
  name: string;
  productId: string;
  expiryDate: string;
}

export interface StockLevel {
  productId: string;
  currentStock: number;
  minimumStock: number;
}

// Cache for performance
let cachedProducts: Product[] = [];
let cachedBatches: Batch[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch live products from n8n/Supabase
export const fetchLiveProducts = async (): Promise<Product[]> => {
  try {
    const result = await submitToWebhook({ action: 'get-products' }, 'GET_PRODUCTS');
    
    if (result.success && result.data) {
      const products = result.data.products || [];
      cachedProducts = products;
      return products;
    }
    
    // Fallback to cached data if request fails
    if (cachedProducts.length > 0) {
      console.warn('Using cached products due to fetch failure');
      return cachedProducts;
    }
    
    // Ultimate fallback to prevent app crash
    return getDefaultProducts();
  } catch (error) {
    console.error('Error fetching live products:', error);
    return cachedProducts.length > 0 ? cachedProducts : getDefaultProducts();
  }
};

// Fetch live batches from n8n/Supabase
export const fetchLiveBatches = async (): Promise<Batch[]> => {
  try {
    const result = await submitToWebhook({ action: 'get-batches' }, 'GET_BATCHES');
    
    if (result.success && result.data) {
      const batches = result.data.batches || [];
      cachedBatches = batches;
      return batches;
    }
    
    if (cachedBatches.length > 0) {
      console.warn('Using cached batches due to fetch failure');
      return cachedBatches;
    }
    
    return getDefaultBatches();
  } catch (error) {
    console.error('Error fetching live batches:', error);
    return cachedBatches.length > 0 ? cachedBatches : getDefaultBatches();
  }
};

// Fetch stock levels
export const fetchStockLevels = async (): Promise<StockLevel[]> => {
  try {
    const result = await submitToWebhook({ action: 'get-stock-levels' }, 'GET_STOCK_LEVELS');
    
    if (result.success && result.data) {
      return result.data.stockLevels || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching stock levels:', error);
    return [];
  }
};

// Main function to get all live data with caching
export const getLiveData = async (forceRefresh = false) => {
  const now = Date.now();
  const shouldRefresh = forceRefresh || (now - lastFetchTime) > CACHE_DURATION;
  
  if (!shouldRefresh && cachedProducts.length > 0 && cachedBatches.length > 0) {
    return {
      products: cachedProducts,
      batches: cachedBatches
    };
  }
  
  try {
    const [products, batches] = await Promise.all([
      fetchLiveProducts(),
      fetchLiveBatches()
    ]);
    
    lastFetchTime = now;
    
    return {
      products,
      batches
    };
  } catch (error) {
    console.error('Error fetching live data:', error);
    return {
      products: cachedProducts.length > 0 ? cachedProducts : getDefaultProducts(),
      batches: cachedBatches.length > 0 ? cachedBatches : getDefaultBatches()
    };
  }
};

// Add new product via backend
export const addLiveProduct = async (product: Omit<Product, 'id'>): Promise<boolean> => {
  try {
    const result = await submitToWebhook({
      action: 'add-product',
      product: {
        ...product,
        id: generateId() // Generate ID if not provided by backend
      }
    }, 'ADD_PRODUCT');
    
    if (result.success) {
      // Invalidate cache to force refresh
      lastFetchTime = 0;
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error adding product:', error);
    return false;
  }
};

// Add new batch via backend
export const addLiveBatch = async (batch: Omit<Batch, 'id'>): Promise<boolean> => {
  try {
    const result = await submitToWebhook({
      action: 'log-batch',
      batch: {
        ...batch,
        id: generateId()
      }
    }, 'LOG_BATCH');
    
    if (result.success) {
      lastFetchTime = 0;
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error adding batch:', error);
    return false;
  }
};

// Update stock levels
export const updateLiveStock = async (productId: string, newStock: number): Promise<boolean> => {
  try {
    const result = await submitToWebhook({
      action: 'update-stock',
      updates: [{
        productId,
        newStock,
        operation: 'set'
      }]
    }, 'UPDATE_STOCK');
    
    return result.success;
  } catch (error) {
    console.error('Error updating stock:', error);
    return false;
  }
};

// Helper function to generate IDs
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Default/fallback data to prevent app crashes
const getDefaultProducts = (): Product[] => [
  { id: "p001", name: "Royal Canin Kitten 2kg" },
  { id: "p002", name: "Meow Mix Adult Cat 1kg" },
  { id: "p003", name: "Frontline Plus Cat" },
  { id: "p004", name: "Hills Science Diet Dog Food 5kg" },
  { id: "p005", name: "Advantage II Flea Treatment" },
  { id: "p006", name: "Pet Safe Nail Clippers" },
  { id: "p007", name: "Purina Pro Plan Kitten Food" }
];

const getDefaultBatches = (): Batch[] => [
  { id: "b001", name: "RC-2024-A", productId: "p001", expiryDate: "2025-06-15" },
  { id: "b002", name: "RC-2024-B", productId: "p001", expiryDate: "2025-08-20" },
  { id: "b003", name: "MM-2024-A", productId: "p002", expiryDate: "2025-04-10" },
  { id: "b004", name: "FP-2024-A", productId: "p003", expiryDate: "2025-12-31" },
  { id: "b005", name: "HD-2024-A", productId: "p004", expiryDate: "2025-09-15" },
  { id: "b006", name: "AD-2024-A", productId: "p005", expiryDate: "2025-07-30" }
];

// Export for backward compatibility
export const mockProducts = getDefaultProducts();
export const mockBatches = getDefaultBatches();
