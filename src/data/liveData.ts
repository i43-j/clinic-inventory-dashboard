import { useState, useEffect } from 'react';

export interface StockLevel {
  productId: number | string;
  productName: string;
  currentStock: number;
  minimumStock: number;
  // ... you can include other fields from the API response if needed
}

export function useLiveData(): { data: StockLevel[] | null; error: Error | null } {
  const [data, setData] = useState<StockLevel[] | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStockLevels = async () => {
      try {
        const response = await fetch('/get-stock-levels');
        if (!response.ok) {
          throw new Error(`Error fetching stock levels: ${response.status} ${response.statusText}`);
        }
        const stockData: StockLevel[] = await response.json();
        setData(stockData);
      } catch (err) {
        // If an error occurs (network issue, JSON parsing error, etc.), save it to state
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    };

    fetchStockLevels();
  }, []);  // empty dependency array means this runs once on component mount

  return { data, error };
}
