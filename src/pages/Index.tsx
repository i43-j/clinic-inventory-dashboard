import React, { useState } from 'react';
import { MainMenu } from '../components/MainMenu';
import { DashboardStats } from '../components/DashboardStats';
import { LogNewBatchForm } from '../components/forms/LogNewBatchForm';
import { ViewStockForm } from '../components/forms/ViewStockForm';
import { ViewClosestExpiryForm } from '../components/forms/ViewClosestExpiryForm';
import { UpdatingStockForm } from '../components/forms/UpdatingStockForm';
import { AddingProductForm } from '../components/forms/AddingProductForm';
import { ResultPage } from '../components/ResultPage';
import { ClinicHeader } from '../components/ClinicHeader';

export type ActionType = 
  | 'log-batch' 
  | 'view-stock' 
  | 'view-expiry' 
  | 'update-stock' 
  | 'add-product'
  | null;

export interface SubmissionResult {
  success: boolean;
  data?: any;
  error?: string;
}

const Index = () => {
  const [currentAction, setCurrentAction] = useState<ActionType>(null);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);

  // Mock data for dashboard - replace with actual API calls
  const mockDashboardData = {
    totalProducts: 42,
    expiringBatches: 3,
    outOfStockSKUs: 1,
    lastAddedProduct: "Royal Canin Kitten 2kg",
    recentActivity: [
      { id: "1", action: "Logged new batch", product: "Royal Canin", date: "07/03" },
      { id: "2", action: "Updated stock", product: "Frontline Plus", date: "06/03" },
      { id: "3", action: "Added product", product: "Hill's Science Diet", date: "05/03" }
    ]
  };

  const handleActionSelect = (action: ActionType) => {
    setCurrentAction(action);
    setSubmissionResult(null);
  };

  const handleFormSubmit = (result: SubmissionResult) => {
    setSubmissionResult(result);
  };

  const handleBackToMenu = () => {
    setCurrentAction(null);
    setSubmissionResult(null);
  };

  const renderCurrentView = () => {
    // Show result page if we have submission results
    if (submissionResult) {
      return (
        <ResultPage 
          result={submissionResult} 
          onBackToMenu={handleBackToMenu}
          onRetry={() => setSubmissionResult(null)}
        />
      );
    }

    // Show appropriate form based on selected action
    switch (currentAction) {
      case 'log-batch':
        return <LogNewBatchForm onSubmit={handleFormSubmit} onBack={handleBackToMenu} />;
      case 'view-stock':
        return <ViewStockForm onSubmit={handleFormSubmit} onBack={handleBackToMenu} />;
      case 'view-expiry':
        return <ViewClosestExpiryForm onSubmit={handleFormSubmit} onBack={handleBackToMenu} />;
      case 'update-stock':
        return <UpdatingStockForm onSubmit={handleFormSubmit} onBack={handleBackToMenu} />;
      case 'add-product':
        return <AddingProductForm onSubmit={handleFormSubmit} onBack={handleBackToMenu} />;
      default:
        return (
          <>
            <DashboardStats {...mockDashboardData} />
            <MainMenu onActionSelect={handleActionSelect} />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <ClinicHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {renderCurrentView()}
      </main>
    </div>
  );
};

export default Index;
