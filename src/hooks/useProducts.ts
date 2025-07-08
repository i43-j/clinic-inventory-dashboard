import { useState, useEffect } from 'react';
import { Product } from '../types';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('🔄 Fetching products via proxy...');
        setLoading(true);
        setError(null);

        const response = await fetch('/api/get-products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });

        console.log('📦 Products response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('📦 Products data received:', data);
          
          // Handle both array and object responses
          const productsArray = Array.isArray(data) ? data : (data.products || []);
          setProducts(productsArray);
        } else {
          const errorText = `Failed to fetch products: ${response.status} ${response.statusText}`;
          console.error('❌ Products API error:', errorText);
          setError(errorText);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('❌ Products fetch failed:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
};