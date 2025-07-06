
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { SubmissionResult } from '../../pages/Index';
import { useProducts } from '../../hooks/useLiveData';

interface ViewStockFormProps {
  onSubmit: (result: SubmissionResult) => void;
  onBack: () => void;
}

interface FormData {
  product: string;
}

export const ViewStockForm: React.FC<ViewStockFormProps> = ({ onSubmit, onBack }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { products, loading: productsLoading, error: productsError } = useProducts();
  const { handleSubmit, setValue, watch } = useForm<FormData>();

  const selectedProduct = watch('product');

  const onFormSubmit = async (data: FormData) => {
    if (!data.product) {
      onSubmit({ success: false, error: 'Please select a product to view stock' });
      return;
    }

    setIsSubmitting(true);
    
    const submissionData = {
      action: 'view-stock',
      ...data
    };

    try {
      const response = await fetch('https://i43-j.app.n8n.cloud/webhook/view-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });
      
      const result: SubmissionResult = response.ok 
        ? { success: true, data: await response.json() }
        : { success: false, error: 'Network error occurred' };
      
      onSubmit(result);
    } catch (error) {
      onSubmit({ success: false, error: 'Network error occurred' });
    }
    setIsSubmitting(false);
  };

  if (productsLoading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading products...</span>
        </CardContent>
      </Card>
    );
  }

  if (productsError) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="py-8">
          <p className="text-red-600 text-center">Error loading products: {productsError}</p>
          <Button onClick={onBack} className="w-full mt-4">Back to Menu</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>📊</span>
          <span>View Stock</span>
        </CardTitle>
        <CardDescription>Check current inventory levels for a specific product</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="product">Product *</Label>
            <Select onValueChange={(value) => setValue('product', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Search and select a product..." />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600">Select a product to view its current stock levels and batch information</p>
          </div>

          <div className="flex space-x-3">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1">
              Back to Menu
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedProduct || isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Loading Stock...' : 'View Stock'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
