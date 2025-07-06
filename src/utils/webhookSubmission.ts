import { SubmissionResult } from '../pages/Index';

// Proxy endpoint configuration - replace YOUR_PROJECT_ID with your actual Supabase project ID
const PROXY_BASE_URL = 'https://xzuenzawbfndvfwfghzi.supabase.co/functions/v1/webhook-proxy';

// Webhook endpoints configuration
const WEBHOOK_ENDPOINTS = {
  OCR_PROCESS: {
    primary: 'ocr-process',
    fallback: 'ocr-process' // Using same endpoint for now
  },
  LOG_BATCH: {
    primary: 'log-batch',
    fallback: 'log-batch'
  },
  GET_PRODUCTS: {
    primary: 'get-products',
    fallback: 'get-products'
  },
  GET_BATCHES: {
    primary: 'get-batches',
    fallback: 'get-batches'
  },
  GET_STOCK_LEVELS: {
    primary: 'get-stock-levels',
    fallback: 'get-stock-levels'
  },
  VIEW_STOCK: {
    primary: 'view-stock',
    fallback: 'view-stock'
  },
  VIEW_EXPIRY: {
    primary: 'view-expiry',
    fallback: 'view-expiry'
  },
  UPDATE_STOCK: {
    primary: 'update-stock',
    fallback: 'update-stock'
  },
  ADD_PRODUCT: {
    primary: 'add-product',
    fallback: 'add-product'
  },
  DASHBOARD_STATS: {
    primary: 'dashboard-stats',
    fallback: 'dashboard-stats'
  }
};

const createFetchWithTimeout = (timeoutMs: number = 30000) => {
  return (url: string, options: RequestInit): Promise<Response> => {
    return Promise.race([
      fetch(url, options),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
      )
    ]);
  };
};

export const submitToWebhook = async (data: any | FormData, action: string): Promise<SubmissionResult> => {
  console.log('Submitting data for action:', action, data);

  const webhookConfig = WEBHOOK_ENDPOINTS[action as keyof typeof WEBHOOK_ENDPOINTS];
  if (!webhookConfig) {
    return { success: false, error: 'Invalid action specified' };
  }

  const isFormData = data instanceof FormData;
  const fetchWithTimeout = createFetchWithTimeout(30000);
  
  // Use proxy endpoint instead of direct webhook calls
  const proxyUrl = `${PROXY_BASE_URL}?endpoint=${webhookConfig.primary}`;
  
  const requestOptions: RequestInit = {
    method: 'POST',
    body: isFormData ? data : JSON.stringify(data),
  };

  if (!isFormData) {
    requestOptions.headers = {
      'Content-Type': 'application/json',
    };
  }

  try {
    const response = await fetchWithTimeout(proxyUrl, requestOptions);

    if (response.ok) {
      const responseData = await response.json();
      console.log('Webhook proxy success:', responseData);
      return { success: true, data: responseData };
    } else {
      console.log('Webhook proxy failed with status:', response.status);
      const errorText = await response.text();
      return { 
        success: false, 
        error: `Webhook failed with status ${response.status}: ${errorText}` 
      };
    }
  } catch (error) {
    console.log('Webhook proxy error:', error);
    const isTimeout = error instanceof Error && error.message === 'Request timeout';
    return {
      success: false,
      error: isTimeout 
        ? 'Request timed out after 30 seconds. Please check your connection and try again.'
        : 'Webhook request failed. Please check your internet connection and try again.'
    };
  }
};

export const processImageOCR = async (imageFile: File): Promise<SubmissionResult> => {
  console.log('Processing image for OCR:', imageFile.name);

  const formData = new FormData();
  formData.append('action', 'ocr-process');
  formData.append('image', imageFile);

  const fetchWithTimeout = createFetchWithTimeout(30000);
  const webhookConfig = WEBHOOK_ENDPOINTS.OCR_PROCESS;

  // Use proxy endpoint instead of direct webhook calls
  const proxyUrl = `${PROXY_BASE_URL}?endpoint=${webhookConfig.primary}`;

  const requestOptions: RequestInit = {
    method: 'POST',
    body: formData,
  };

  try {
    const response = await fetchWithTimeout(proxyUrl, requestOptions);

    if (response.ok) {
      const responseData = await response.json();
      console.log('OCR processing success:', responseData);
      return { success: true, data: responseData };
    } else {
      console.log('OCR processing failed with status:', response.status);
      const errorText = await response.text();
      return { 
        success: false, 
        error: `OCR processing failed with status ${response.status}: ${errorText}` 
      };
    }
  } catch (error) {
    console.log('OCR processing error:', error);
    const isTimeout = error instanceof Error && error.message === 'Request timeout';
    return {
      success: false,
      error: isTimeout 
        ? 'OCR processing timed out after 30 seconds. You can still fill out the form manually.'
        : 'OCR processing failed. You can still fill out the form manually.'
    };
  }
};
