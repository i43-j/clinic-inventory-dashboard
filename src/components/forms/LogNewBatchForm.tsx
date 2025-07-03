
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
import { mockProducts } from '../../data/mockData';

interface LogNewBatchFormProps {
  onSubmit: (result: SubmissionResult) => void;
  onBack: () => void;
}

interface FormData {
  product: string;
  batchName: string;
  quantity: number;
  expiryDate: string;
  receivedAt: string;
  receivedBy: string;
  notes: string;
}

export const LogNewBatchForm: React.FC<LogNewBatchFormProps> = ({ onSubmit, onBack }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    defaultValues: {
      receivedAt: new Date().toISOString().split('T')[0],
      receivedBy: '',
      notes: ''
    }
  });

  const selectedProduct = watch('product');

  const onFormSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    const submissionData = {
      action: 'log-batch',
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
          <span>📦</span>
          <span>Log New Batch</span>
        </CardTitle>
        <CardDescription>Record a new batch of products received into inventory</CardDescription>
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
            {errors.product && <p className="text-sm text-red-600">Product selection is required</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="batchName">Batch Name *</Label>
            <Input
              id="batchName"
              placeholder="e.g., RoyalCanin-2024-A"
              {...register('batchName', { required: 'Batch name is required' })}
            />
            {errors.batchName && <p className="text-sm text-red-600">{errors.batchName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              placeholder="Enter quantity received"
              {...register('quantity', { 
                required: 'Quantity is required',
                min: { value: 1, message: 'Quantity must be at least 1' }
              })}
            />
            {errors.quantity && <p className="text-sm text-red-600">{errors.quantity.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date *</Label>
            <Input
              id="expiryDate"
              type="date"
              {...register('expiryDate', { required: 'Expiry date is required' })}
            />
            {errors.expiryDate && <p className="text-sm text-red-600">{errors.expiryDate.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="receivedAt">Received At</Label>
            <Input
              id="receivedAt"
              type="date"
              {...register('receivedAt')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="receivedBy">Received By</Label>
            <Input
              id="receivedBy"
              placeholder="Staff member name (optional)"
              {...register('receivedBy')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any remarks about this batch..."
              rows={3}
              {...register('notes')}
            />
          </div>

          <div className="flex space-x-3">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1">
              Back to Menu
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Logging Batch...' : 'Log Batch'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
