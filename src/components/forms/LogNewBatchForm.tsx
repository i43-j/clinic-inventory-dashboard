import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Upload, Loader2 } from 'lucide-react';
import { SubmissionResult } from '../../pages/Index';
import { useProducts } from '../../hooks/useProducts';

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
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const { products, loading: productsLoading, error: productsError } = useProducts();
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    defaultValues: {
      receivedAt: new Date().toISOString().split('T')[0],
      receivedBy: '',
      notes: ''
    }
  });

  const processOCR = async (file: File) => {
    setIsProcessingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      console.log('🔄 Processing OCR via proxy...');
      
      const response = await fetch('https://i43-j.app.n8n.cloud/webhook/ocr-process', {
        method: 'POST',
        body: formData
      });
      
      console.log('📷 OCR response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data) && data.length > 0) {
          const ocrData = data[0]; // Take first result from array
          
          if (ocrData.quantity) {
            const qty = parseInt(ocrData.quantity.toString());
            if (!isNaN(qty)) {
              setValue('quantity', qty);
            }
          }
          
          if (ocrData.expiryDate || ocrData.expiry) {
            const expiryStr = ocrData.expiryDate || ocrData.expiry;
            const parsedDate = new Date(expiryStr);
            if (!isNaN(parsedDate.getTime())) {
              setValue('expiryDate', parsedDate.toISOString().split('T')[0]);
            }
          }
          
          console.log('OCR data applied to form:', ocrData);
        }
      }
    } catch (error) {
      console.error('OCR processing failed:', error);
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      await processOCR(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const onFormSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('action', 'log-batch');
    formData.append('product', data.product);
    formData.append('batchName', data.batchName);
    formData.append('quantity', data.quantity.toString());
    formData.append('expiryDate', data.expiryDate);
    formData.append('receivedAt', data.receivedAt);
    formData.append('receivedBy', data.receivedBy);
    formData.append('notes', data.notes);
    
    if (selectedImage) {
      formData.append('image', selectedImage);
    }

    try {
      console.log('🔄 Logging batch via proxy...', data);
      
      const response = await fetch('https://i43-j.app.n8n.cloud/webhook/log-batch', {
        method: 'POST',
        body: formData
      });
      
      console.log('📦 Log batch response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📦 Log batch data received:', data);
        onSubmit({ success: true, data });
      } else {
        console.error('❌ Log batch API error:', response.status, response.statusText);
        onSubmit({ success: false, error: `Request failed with status ${response.status}` });
      }
    } catch (error) {
      console.error('❌ Log batch fetch failed:', error);
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
          <span>📦</span>
          <span>Log New Batch</span>
        </CardTitle>
        <CardDescription>Record a new batch of products received into inventory</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="imageUpload">Attach Image (Optional)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              {isProcessingImage ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                  </div>
                  <div>
                    <p className="text-blue-600 font-medium">Processing image...</p>
                    <p className="text-sm text-gray-500">Extracting batch information automatically</p>
                  </div>
                  <Progress value={75} className="w-full" />
                </div>
              ) : imagePreview ? (
                <div className="space-y-4">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-w-full max-h-48 mx-auto rounded-lg shadow-sm"
                  />
                  <div className="flex space-x-2 justify-center">
                    <Button type="button" variant="outline" size="sm" onClick={removeImage}>
                      Remove Image
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Upload className="h-12 w-12 text-gray-400" />
                  </div>
                  <div>
                    <label htmlFor="imageUpload" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-500 font-medium">Click to upload</span>
                      <span className="text-gray-500"> or drag and drop</span>
                    </label>
                    <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              )}
              
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={isProcessingImage}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product">Product *</Label>
            <Select onValueChange={(value) => setValue('product', value)} value={watch('product')}>
              <SelectTrigger>
                <SelectValue placeholder="Search and select a product..." />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id.toString()}>
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
                min: { value: 1, message: 'Quantity must be at least 1' },
                valueAsNumber: true
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
              disabled={isSubmitting || isProcessingImage}
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