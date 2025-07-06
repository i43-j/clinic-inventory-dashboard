import { submitToWebhook } from '../data/webhookService';

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

/* ------------------------------------------------------------------ */
/*  Simple in-memory cache                                            */
/* ------------------------------------------------------------------ */
let cachedProducts: Product[] = [];
let cachedBatches: Batch[] = [];
let lastFetch = 0;
const CACHE_MS = 5 * 60 * 1000; // 5 min

/* ------------------------------------------------------------------ */
/*  READ-ONLY fetches (now via GET)                                   */
/* ------------------------------------------------------------------ */
export const fetchLiveProducts = async (): Promise<Product[]> => {
  const r = await submitToWebhook(null, 'GET_PRODUCTS');
  if (r.success && r.data?.products) cachedProducts = r.data.products;
  return cachedProducts;
};

export const fetchLiveBatches = async (): Promise<Batch[]> => {
  const r = await submitToWebhook(null, 'GET_BATCHES');
  if (r.success && r.data?.batches) cachedBatches = r.data.batches;
  return cachedBatches;
};

export const fetchStockLevels = async (): Promise<StockLevel[]> => {
  const r = await submitToWebhook(null, 'GET_STOCK_LEVELS');
  return r.success && r.data?.stockLevels ? r.data.stockLevels : [];
};

/* ------------------------------------------------------------------ */
/*  Combined fetch with caching                                       */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/*  Mutations (remain POST)                                           */
/* ------------------------------------------------------------------ */
export const addLiveProduct = async (
  product: Omit<Product, 'id'>,
): Promise<boolean> => {
  const res = await submitToWebhook(
    { action: 'add-product', product: { ...product, id: uid() } },
    'ADD_PRODUCT',
  );
  if (res.success) lastFetch = 0;
  return res.success;
};

export const addLiveBatch = async (
  batch: Omit<Batch, 'id'>,
): Promise<boolean> => {
  const res = await submitToWebhook(
    { action: 'log-batch', batch: { ...batch, id: uid() } },
    'LOG_BATCH',
  );
  if (res.success) lastFetch = 0;
  return res.success;
};

export const updateLiveStock = async (
  productId: string,
  newStock: number,
): Promise<boolean> => {
  const res = await submitToWebhook(
    { action: 'update-stock', updates: [{ productId, newStock }] },
    'UPDATE_STOCK',
  );
  return res.success;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */
const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2);
