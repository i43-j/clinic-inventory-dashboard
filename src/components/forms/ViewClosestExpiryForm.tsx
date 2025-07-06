
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { SubmissionResult } from '../../pages/Index';
import { useProducts } from '../../hooks/useLiveData';

interface ViewClosestExpiryFormProps {
  onSubmit: (result: SubmissionResult) => void;
  onBack: () => void;
}

interface FormData {
  product?: string;
  showAll?: boolean;
}

export const ViewClosestExpiryForm: React.FC<ViewClosestExpiryFormProps> = ({ onSubmit, onBack }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { products, loading: productsLoading, error: productsError } = useProducts();
  const { handleSubmit, setValue, watch } = useForm<FormData>();

  const selectedProduct = watch('product');

  const onFormSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    const submissionData = {
      action: 'view-expiry',
      product: data.product || 'all'
    };

    try {
      const response = await fetch('https://i43-j.app.n8n.cloud/webhook/view-expiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });
      
      const result: SubmissionResult = response.ok 
        ? { success: true, data: await response.json() }
        : { success: false, error: `Request failed with status ${response.status}` };
      
      onSubmit(result);
    } catch (error) {
      onSubmit({ success: false, error: 'Network error occurred' });
    }
    setIsSubmitting(false);
  };

  const handleShowAll = () => {
    setIsSubmitting(true);
    
    const submissionData = {
      action: 'view-expiry',
      product: 'all'
    };

    submitToWebhook(submissionData, 'VIEW_EXPIRY').then((result) => {
      onSubmit(result);
      setIsSubmitting(false);
    });
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
          <span>⏰</span>
          <span>View Closest Expiry</span>
        </CardTitle>
        <CardDescription>Check products that are expiring soon to prioritize usage</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="text-center">
              <Button 
                onClick={handleShowAll}
                disabled={isSubmitting}
                className="w-full bg-orange-600 hover:bg-orange-700"
                size="lg"
              >
                {isSubmitting ? 'Loading...' : 'Show All Products by Expiry Date'}
              </Button>
              <p className="text-sm text-gray-600 mt-2">View all products sorted by expiry date</p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or filter by product</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product">Specific Product</Label>
                <Select onValueChange={(value) => setValue('product', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a specific product..." />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                disabled={!selectedProduct || isSubmitting}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                {isSubmitting ? 'Loading...' : 'View Expiry for Selected Product'}
              </Button>
            </form>
          </div>

          <div className="flex space-x-3">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1">
              Back to Menu
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
