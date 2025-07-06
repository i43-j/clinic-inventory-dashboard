export interface Product {
  id: string;
  name: string;
  skuCode: string;
  category: string;
  supplierName: string;
  unit: string;
  threshold: number;
}

export interface Batch {
  id: string;
  productId: string;
  batchName: string;
  quantity: number;
  expiryDate: string;
  receivedBy: string;
  receivedAt: string;
  notes?: string;
}

export interface StockLevel {
  productId: string;
  availableStock: number;
  expiringBatches: number;
}

let cachedProducts: Product[] = [];
let cachedBatches: Batch[] = [];
let lastFetch = 0;
const CACHE_MS = 5 * 60 * 1000; // 5 min

export const fetchLiveProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch('https://i43-j.app.n8n.cloud/webhook/get-products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data?.products) cachedProducts = data.products;
    }
  } catch (error) {
    console.error('Products fetch failed:', error);
  }
  return cachedProducts;
};

export const fetchLiveBatches = async (): Promise<Batch[]> => {
  try {
    const response = await fetch('https://i43-j.app.n8n.cloud/webhook/get-batches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data?.batches) cachedBatches = data.batches;
    }
  } catch (error) {
    console.error('Batches fetch failed:', error);
  }
  return cachedBatches;
};

export const fetchStockLevels = async (): Promise<StockLevel[]> => {
  try {
    const response = await fetch('https://i43-j.app.n8n.cloud/webhook/get-stock-levels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    if (response.ok) {
      const data = await response.json();
      return data?.stockLevels || [];
    }
  } catch (error) {
    console.error('Stock levels fetch failed:', error);
  }
  return [];
};

export const getLiveData = async (force = false) => {
  const now = Date.now();
  const refresh = force || now - lastFetch > CACHE_MS;
  if (!refresh && cachedProducts.length && cachedBatches.length) {
    return { products: cachedProducts, batches: cachedBatches };
  }
  const [products, batches] = await Promise.all([
    fetchLiveProducts(),
    fetchLiveBatches(),
  ]);
  lastFetch = now;
  return { products, batches };
};

export const addLiveProduct = async (
  product: Omit<Product, 'id'>,
): Promise<boolean> => {
  try {
    const response = await fetch('https://i43-j.app.n8n.cloud/webhook/add-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add-product', product: { ...product, id: uid() } })
    });
    if (response.ok) lastFetch = 0;
    return response.ok;
  } catch (error) {
    console.error('Add product failed:', error);
    return false;
  }
};

export const addLiveBatch = async (
  batch: Omit<Batch, 'id'>,
): Promise<boolean> => {
  try {
    const response = await fetch('https://i43-j.app.n8n.cloud/webhook/log-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'log-batch', batch: { ...batch, id: uid() } })
    });
    if (response.ok) lastFetch = 0;
    return response.ok;
  } catch (error) {
    console.error('Log batch failed:', error);
    return false;
  }
};

export const updateLiveStock = async (
  productId: string,
  newStock: number,
): Promise<boolean> => {
  try {
    const response = await fetch('https://i43-j.app.n8n.cloud/webhook/update-stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update-stock', updates: [{ productId, newStock }] })
    });
    return response.ok;
  } catch (error) {
    console.error('Update stock failed:', error);
    return false;
  }
};

const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2);