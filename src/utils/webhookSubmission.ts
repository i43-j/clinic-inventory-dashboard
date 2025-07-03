
import { SubmissionResult } from '../pages/Index';

const PRIMARY_WEBHOOK = 'https://i43-j.app.n8n.cloud/webhook-test/form';
const FALLBACK_WEBHOOK = 'https://i43-j.app.n8n.cloud/webhook/form';

export const submitToWebhook = async (data: any): Promise<SubmissionResult> => {
  console.log('Submitting data:', data);

  // Try primary webhook first
  try {
    const response = await fetch(PRIMARY_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

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
      const fallbackResponse = await fetch(FALLBACK_WEBHOOK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

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
