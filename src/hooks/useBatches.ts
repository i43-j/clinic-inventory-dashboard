import { useState, useEffect } from 'react';
import { Batch } from '../types';

export const useBatches = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        console.log('🔄 Fetching batches via proxy...');
        setLoading(true);
        setError(null);

        const response = await fetch('https://i43-j.app.n8n.cloud/webhook/get-batches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });

        console.log('📦 Batches response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('📦 Batches data received:', data);
          
          // Handle both array and object responses
          const batchesArray = Array.isArray(data) ? data : (data.batches || []);
          setBatches(batchesArray);
        } else {
          const errorText = `Failed to fetch batches: ${response.status} ${response.statusText}`;
          console.error('❌ Batches API error:', errorText);
          setError(errorText);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('❌ Batches fetch failed:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, []);

  return { batches, loading, error };
};