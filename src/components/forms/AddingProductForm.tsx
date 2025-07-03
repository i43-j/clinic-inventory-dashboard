
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SubmissionResult } from '../../pages/Index';
import { submitToWebhook } from '../../utils/webhookSubmission';

interface AddingProductFormProps {
  onSubmit: (result: SubmissionResult) => void;
  onBack: () => void;
}

interface FormData {
  productName: string;
  skuCode: string;
  category: string;
  unit: string;
  supplierName: string;
}

const categories = [
  { value: 'medical-equipment', label: 'Medical Equipment' },
  { value: 'medicine', label: 'Medicine' },
  { value: 'food', label: 'Food' }
];

export const AddingProductForm: React.FC<AddingProductFormProps> = ({ onSubmit, onBack }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>();

  const onFormSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    const submissionData = {
      action: 'add-product',
      ...data
    };

    const result = await submitToWebhook(submissionData);
    onSubmit(result);
    setIsSubmitting(false);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>➕</span>
          <span>Add New Product</span>
        </CardTitle>
        <CardDescription>Register a new product in the inventory management system</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="productName">Product Name *</Label>
            <Input
              id="productName"
              placeholder="e.g., Royal Canin Kitten 2kg"
              {...register('productName', { required: 'Product name is required' })}
            />
            {errors.productName && <p className="text-sm text-red-600">{errors.productName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="skuCode">SKU Code *</Label>
            <Input
              id="skuCode"
              placeholder="e.g., RC-KIT-2KG"
              {...register('skuCode', { required: 'SKU code is required' })}
            />
            {errors.skuCode && <p className="text-sm text-red-600">{errors.skuCode.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select onValueChange={(value) => setValue('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-red-600">Category selection is required</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <Input
              id="unit"
              placeholder="e.g., kg, pieces, bottles"
              {...register('unit')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplierName">Supplier Name</Label>
            <Input
              id="supplierName"
              placeholder="e.g., Pet Supplies Co."
              {...register('supplierName')}
            />
          </div>

          <div className="flex space-x-3">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1">
              Back to Menu
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              {isSubmitting ? 'Adding Product...' : 'Add Product'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
