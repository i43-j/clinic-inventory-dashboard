
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { SubmissionResult } from '../../pages/Index';
import { submitToWebhook } from '../../utils/webhookSubmission';
import { mockProducts } from '../../data/mockData';

interface ViewStockFormProps {
  onSubmit: (result: SubmissionResult) => void;
  onBack: () => void;
}

interface FormData {
  product: string;
}

export const ViewStockForm: React.FC<ViewStockFormProps> = ({ onSubmit, onBack }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
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

    const result = await submitToWebhook(submissionData, 'view-stock');
    onSubmit(result);
    setIsSubmitting(false);
  };

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
                {mockProducts.map((product) => (
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
