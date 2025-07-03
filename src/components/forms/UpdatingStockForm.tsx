
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SubmissionResult } from '../../pages/Index';
import { submitToWebhook } from '../../utils/webhookSubmission';
import { mockProducts, mockBatches } from '../../data/mockData';

interface UpdatingStockFormProps {
  onSubmit: (result: SubmissionResult) => void;
  onBack: () => void;
}

interface FormData {
  product: string;
  batch: string;
  quantity: number;
  reason: string;
}

export const UpdatingStockForm: React.FC<UpdatingStockFormProps> = ({ onSubmit, onBack }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>();

  const selectedProduct = watch('product');
  const selectedBatch = watch('batch');

  const availableBatches = mockBatches.filter(batch => batch.productId === selectedProduct);

  const onFormSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    const submissionData = {
      action: 'update-stock',
      ...data,
      quantity: Number(data.quantity)
    };

    const result = await submitToWebhook(submissionData);
    onSubmit(result);
    setIsSubmitting(false);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>✏️</span>
          <span>Update Stock</span>
        </CardTitle>
        <CardDescription>Modify existing stock quantities for specific batches</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="product">Product *</Label>
            <Select onValueChange={(value) => setValue('product', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a product..." />
              </SelectTrigger>
              <SelectContent>
                {mockProducts.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.product && <p className="text-sm text-red-600">Product selection is required</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="batch">Batch *</Label>
            <Select 
              onValueChange={(value) => setValue('batch', value)}
              disabled={!selectedProduct}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedProduct ? "Select a batch..." : "Select a product first"} />
              </SelectTrigger>
              <SelectContent>
                {availableBatches.length > 0 ? (
                  availableBatches.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.name} (Exp: {batch.expiryDate})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-batches" disabled>
                    No batches available for selected product
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.batch && <p className="text-sm text-red-600">Batch selection is required</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">New Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              placeholder="Enter new quantity"
              {...register('quantity', { 
                required: 'Quantity is required',
                min: { value: 0, message: 'Quantity cannot be negative' }
              })}
            />
            {errors.quantity && <p className="text-sm text-red-600">{errors.quantity.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason/Notes</Label>
            <Textarea
              id="reason"
              placeholder="Reason for stock update (e.g., dispensed to patient, damaged, expired...)"
              rows={3}
              {...register('reason')}
            />
          </div>

          <div className="flex space-x-3">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1">
              Back to Menu
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting ? 'Updating Stock...' : 'Update Stock'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
