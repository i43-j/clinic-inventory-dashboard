import { SubmissionResult } from '../pages/Index';

// Separate webhook endpoints for different actions
const WEBHOOKS = {
  OCR_PROCESS: {
    primary: 'https://i43-j.app.n8n.cloud/webhook/ocr-process',
    fallback: 'https://i43-j.app.n8n.cloud/webhook-test/ocr-process'
  },
  LOG_BATCH: {
    primary: 'https://i43-j.app.n8n.cloud/webhook/log-batch',
    fallback: 'https://i43-j.app.n8n.cloud/webhook-test/log-batch'
  },
  GET_PRODUCTS: {
    primary: 'https://i43-j.app.n8n.cloud/webhook/get-products',
    fallback: 'https://i43-j.app.n8n.cloud/webhook-test/get-products'
  },
  GET_BATCHES: {
    primary: 'https://i43-j.app.n8n.cloud/webhook/get-batches',
    fallback: 'https://i43-j.app.n8n.cloud/webhook-test/get-batches'
  },
  GET_STOCK_LEVELS: {
    primary: 'https://i43-j.app.n8n.cloud/webhook/get-stock-levels',
    fallback: 'https://i43-j.app.n8n.cloud/webhook-test/get-stock-levels'
  },
  VIEW_STOCK: {
    primary: 'https://i43-j.app.n8n.cloud/webhook/view-stock',
    fallback: 'https://i43-j.app.n8n.cloud/webhook-test/view-stock'
  },
  VIEW_EXPIRY: {
    primary: 'https://i43-j.app.n8n.cloud/webhook/view-expiry',
    fallback: 'https://i43-j.app.n8n.cloud/webhook-test/view-expiry'
  },
  UPDATE_STOCK: {
    primary: 'https://i43-j.app.n8n.cloud/webhook/update-stock',
    fallback: 'https://i43-j.app.n8n.cloud/webhook-test/update-stock'
  },
  ADD_PRODUCT: {
    primary: 'https://i43-j.app.n8n.cloud/webhook/add-product',
    fallback: 'https://i43-j.app.n8n.cloud/webhook-test/add-product'
  },
  DASHBOARD_STATS: {
    primary: 'https://i43-j.app.n8n.cloud/webhook/dashboard-stats',
    fallback: 'https://i43-j.app.n8n.cloud/webhook-test/dashboard-stats'
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

  const webhookConfig = WEBHOOKS[action as keyof typeof WEBHOOKS];
  if (!webhookConfig) {
    return { success: false, error: 'Invalid action specified' };
  }

  const isFormData = data instanceof FormData;
  const fetchWithTimeout = createFetchWithTimeout(30000);
  
  const requestOptions: RequestInit = {
    method: 'POST',
    body: isFormData ? data : JSON.stringify(data),
  };

  if (!isFormData) {
    requestOptions.headers = {
      'Content-Type': 'application/json',
    };
  }

  // Try primary webhook first
  try {
    const response = await fetchWithTimeout(webhookConfig.primary, requestOptions);

    if (response.ok) {
      const responseData = await response.json();
      console.log('Primary webhook success:', responseData);
      return { success: true, data: responseData };
    } else {
      console.log('Primary webhook failed with status:', response.status);
      throw new Error(`Primary webhook failed with status ${response.status}`);
    }
  } catch (error) {
    console.log('Primary webhook error:', error);
    
    // Try fallback webhook
    try {
      console.log('Trying fallback webhook...');
      const fallbackResponse = await fetchWithTimeout(webhookConfig.fallback, requestOptions);

      if (fallbackResponse.ok) {
        const responseData = await fallbackResponse.json();
        console.log('Fallback webhook success:', responseData);
        return { success: true, data: responseData };
      } else {
        console.log('Fallback webhook failed with status:', fallbackResponse.status);
        throw new Error(`Fallback webhook failed with status ${fallbackResponse.status}`);
      }
    } catch (fallbackError) {
      console.log('Fallback webhook error:', fallbackError);
      const isTimeout = fallbackError instanceof Error && fallbackError.message === 'Request timeout';
      return {
        success: false,
        error: isTimeout 
          ? 'Request timed out after 30 seconds. Please check your connection and try again.'
          : 'Both primary and fallback webhooks failed. Please check your internet connection and try again.'
      };
    }
  }
};

export const processImageOCR = async (imageFile: File): Promise<SubmissionResult> => {
  console.log('Processing image for OCR:', imageFile.name);

  const formData = new FormData();
  formData.append('action', 'ocr-process');
  formData.append('image', imageFile);

  const fetchWithTimeout = createFetchWithTimeout(30000);
  const webhookConfig = WEBHOOKS.OCR_PROCESS;

  const requestOptions: RequestInit = {
    method: 'POST',
    body: formData,
  };

  // Try primary webhook first
  try {
    const response = await fetchWithTimeout(webhookConfig.primary, requestOptions);

    if (response.ok) {
      const responseData = await response.json();
      console.log('OCR processing success:', responseData);
      return { success: true, data: responseData };
    } else {
      console.log('OCR processing failed with status:', response.status);
      throw new Error(`OCR processing failed with status ${response.status}`);
    }
  } catch (error) {
    console.log('OCR processing error:', error);
    
    // Try fallback webhook
    try {
      console.log('Trying fallback webhook for OCR...');
      const fallbackResponse = await fetchWithTimeout(webhookConfig.fallback, requestOptions);

      if (fallbackResponse.ok) {
        const responseData = await fallbackResponse.json();
        console.log('OCR fallback success:', responseData);
        return { success: true, data: responseData };
      } else {
        console.log('OCR fallback failed with status:', fallbackResponse.status);
        throw new Error(`OCR fallback failed with status ${fallbackResponse.status}`);
      }
    } catch (fallbackError) {
      console.log('OCR fallback error:', fallbackError);
      const isTimeout = fallbackError instanceof Error && fallbackError.message === 'Request timeout';
      return {
        success: false,
        error: isTimeout 
          ? 'OCR processing timed out after 30 seconds. You can still fill out the form manually.'
          : 'OCR processing failed. You can still fill out the form manually.'
      };
    }
  }
};
