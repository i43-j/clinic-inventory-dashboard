
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SubmissionResult } from '../pages/Index';

interface ResultPageProps {
  result: SubmissionResult;
  onBackToMenu: () => void;
  onRetry: () => void;
}

export const ResultPage: React.FC<ResultPageProps> = ({ result, onBackToMenu, onRetry }) => {
  if (result.success) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-600">
            <span>✅</span>
            <span>Success!</span>
          </CardTitle>
          <CardDescription>Your request has been processed successfully</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            {result.data?.message && (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{result.data.message}</ReactMarkdown>
              </div>
            )}
            
            {result.data && !result.data.message && (
              <div className="space-y-2">
                <h3 className="font-medium text-green-800">Submission Details:</h3>
                <pre className="text-sm text-green-700 bg-green-100 p-2 rounded overflow-x-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <Button onClick={onBackToMenu} className="flex-1" variant="outline">
              Back to Main Menu
            </Button>
            <Button onClick={onBackToMenu} className="flex-1 bg-green-600 hover:bg-green-700">
              Do Another Action
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-red-600">
          <span>❌</span>
          <span>Error</span>
        </CardTitle>
        <CardDescription>There was an issue processing your request</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{result.error || 'An unexpected error occurred. Please try again.'}</ReactMarkdown>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button onClick={onBackToMenu} className="flex-1" variant="outline">
            Back to Main Menu
          </Button>
          <Button onClick={onRetry} className="flex-1 bg-red-600 hover:bg-red-700">
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
