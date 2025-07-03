
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { SubmissionResult } from '../../pages/Index';
import { submitToWebhook } from '../../utils/webhookSubmission';
import { mockProducts } from '../../data/mockData';

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
  const { handleSubmit, setValue, watch } = useForm<FormData>();

  const selectedProduct = watch('product');

  const onFormSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    const submissionData = {
      action: 'view-expiry',
      product: data.product || 'all'
    };

    const result = await submitToWebhook(submissionData);
    onSubmit(result);
    setIsSubmitting(false);
  };

  const handleShowAll = () => {
    setIsSubmitting(true);
    
    const submissionData = {
      action: 'view-expiry',
      product: 'all'
    };

    submitToWebhook(submissionData).then((result) => {
      onSubmit(result);
      setIsSubmitting(false);
    });
  };

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
                    {mockProducts.map((product) => (
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
