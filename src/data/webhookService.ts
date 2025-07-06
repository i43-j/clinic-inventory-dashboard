import { SubmissionResult } from '../pages/Index';

/** Your deployed Supabase Edge Function proxy URL */
const PROXY_BASE_URL =
  'https://xzuenzawbfndvfwfghzi.supabase.co/functions/v1/webhook-proxy';

/** All webhook endpoints used in the app */
const WEBHOOK_ENDPOINTS = {
  OCR_PROCESS:         { primary: 'ocr-process',       fallback: 'ocr-process' },
  LOG_BATCH:           { primary: 'log-batch',         fallback: 'log-batch'   },
  GET_PRODUCTS:        { primary: 'get-products',      fallback: 'get-products'},
  GET_BATCHES:         { primary: 'get-batches',       fallback: 'get-batches' },
  GET_STOCK_LEVELS:    { primary: 'get-stock-levels',  fallback: 'get-stock-levels' },
  VIEW_STOCK:          { primary: 'view-stock',        fallback: 'view-stock'  },
  VIEW_EXPIRY:         { primary: 'view-expiry',       fallback: 'view-expiry' },
  UPDATE_STOCK:        { primary: 'update-stock',      fallback: 'update-stock'},
  ADD_PRODUCT:         { primary: 'add-product',       fallback: 'add-product' },
  DASHBOARD_STATS:     { primary: 'dashboard-stats',   fallback: 'dashboard-stats' },
} as const;

/** Endpoints that should be invoked with HTTP GET (read-only) */
const READ_ONLY_ACTIONS = new Set([
  'GET_PRODUCTS',
  'GET_BATCHES',
  'GET_STOCK_LEVELS',
  'DASHBOARD_STATS',
]);

/** Small helper to add an abort-style timeout around fetch */
const createFetchWithTimeout = (timeoutMs = 30_000) => {
  return (url: string, options: RequestInit): Promise<Response> =>
    Promise.race([
      fetch(url, options),
      new Promise<Response>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeoutMs),
      ),
    ]);
};

/**
 * Generic helper used throughout the app.
 * Decides at runtime whether to use GET (no body) or POST (JSON / FormData).
 */
export const submitToWebhook = async (
  data: any | FormData | null,
  action: keyof typeof WEBHOOK_ENDPOINTS,
): Promise<SubmissionResult> => {
  console.log('Submitting', { action, data });

  const webhookCfg = WEBHOOK_ENDPOINTS[action];
  if (!webhookCfg) {
    return { success: false, error: `Unknown action "${action}"` };
  }

  const isReadOnly = READ_ONLY_ACTIONS.has(action);
  const isFormData = data instanceof FormData;
  const fetchWithTimeout = createFetchWithTimeout();

  const proxyUrl = `${PROXY_BASE_URL}?endpoint=${webhookCfg.primary}`;

  const req: RequestInit = { method: isReadOnly ? 'GET' : 'POST' };

  if (!isReadOnly) {
    req.body = isFormData ? (data as FormData) : JSON.stringify(data);
    if (!isFormData) req.headers = { 'Content-Type': 'application/json' };
  }

  try {
    const res = await fetchWithTimeout(proxyUrl, req);
    if (!res.ok) {
      const txt = await res.text();
      return { success: false, error: `Webhook ${res.status}: ${txt}` };
    }
    const json = await res.json();
    return { success: true, data: json };
  } catch (err: any) {
    const isTimeout = err instanceof Error && err.message === 'Request timeout';
    return {
      success: false,
      error: isTimeout ? 'Request timed out after 30 s' : 'Network error',
    };
  }
};

/** Convenience wrapper for OCR (multipart/form-data) */
export const processImageOCR = async (image: File): Promise<SubmissionResult> =>
  submitToWebhook(
    (() => {
      const fd = new FormData();
      fd.append('image', image);
      return fd;
    })(),
    'OCR_PROCESS',
  );
