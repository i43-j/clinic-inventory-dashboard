
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ActionType } from '../pages/Index';

interface MainMenuProps {
  onActionSelect: (action: ActionType) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onActionSelect }) => {
  const menuItems = [
    {
      action: 'log-batch' as ActionType,
      title: 'Log New Batch',
      description: 'Record a new batch of products received',
      icon: '📦',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      action: 'view-stock' as ActionType,
      title: 'View Stock',
      description: 'Check current inventory levels\n',
      icon: '📊',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      action: 'view-expiry' as ActionType,
      title: 'View Closest Expiry',
      description: 'See products expiring soon',
      icon: '⏰',
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      action: 'update-stock' as ActionType,
      title: 'Update Stock',
      description: 'Modify existing stock quantities',
      icon: '✏️',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      action: 'add-product' as ActionType,
      title: 'Add Product',
      description: 'Register a new product in the system',
      icon: '➕',
      color: 'bg-indigo-500 hover:bg-indigo-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h2>
        <p className="text-gray-600">Select an action to continue</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item) => (
          <Card key={item.action} className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center pb-2">
              <div className="text-4xl mb-2">{item.icon}</div>
              <CardTitle className="text-lg">{item.title}</CardTitle>
              <CardDescription className="text-sm">{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => onActionSelect(item.action)}
                className={`w-full ${item.color} text-white transition-colors`}
                size="lg"
              >
                Select
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
