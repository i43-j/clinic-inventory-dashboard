
import { SubmissionResult } from '../pages/Index';

const PRIMARY_WEBHOOK = 'https://i43-j.app.n8n.cloud/webhook-test/form';
const FALLBACK_WEBHOOK = 'https://i43-j.app.n8n.cloud/webhook/form';

export const submitToWebhook = async (data: any | FormData): Promise<SubmissionResult> => {
  console.log('Submitting data:', data);

  const isFormData = data instanceof FormData;
  
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
    const response = await fetch(PRIMARY_WEBHOOK, requestOptions);

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
      const fallbackResponse = await fetch(FALLBACK_WEBHOOK, requestOptions);

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
      return {
        success: false,
        error: 'Both primary and fallback webhooks failed. Please check your internet connection and try again.'
      };
    }
  }
};

export const processImageOCR = async (imageFile: File): Promise<SubmissionResult> => {
  console.log('Processing image for OCR:', imageFile.name);

  const formData = new FormData();
  formData.append('action', 'ocr-process');
  formData.append('image', imageFile);

  const requestOptions: RequestInit = {
    method: 'POST',
    body: formData,
  };

  // Try primary webhook first
  try {
    const response = await fetch(PRIMARY_WEBHOOK, requestOptions);

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
      const fallbackResponse = await fetch(FALLBACK_WEBHOOK, requestOptions);

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
      return {
        success: false,
        error: 'OCR processing failed. You can still fill out the form manually.'
      };
    }
  }
};
