
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Clock } from 'lucide-react';

interface DashboardStatsProps {
  totalProducts?: number;
  expiringBatches?: number;
  lowStockItems?: number;
  outOfStockItems?: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalProducts = 0,
  expiringBatches = 0,
  lowStockItems = 0,
  outOfStockItems = 0,
}) => {
  const statsCards = [
    {
      title: "Total Products",
      value: totalProducts,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Expiring Soon",
      value: expiringBatches,
      icon: Clock,
      color: expiringBatches > 0 ? "text-orange-600" : "text-green-600",
      bgColor: expiringBatches > 0 ? "bg-orange-50" : "bg-green-50",
      badge: expiringBatches > 0 ? "Within 7 days" : "All Good"
    },
    {
      title: "Low Stock",
      value: lowStockItems,
      icon: Package,
      color: lowStockItems > 0 ? "text-yellow-600" : "text-green-600",
      bgColor: lowStockItems > 0 ? "bg-yellow-50" : "bg-green-50",
      badge: lowStockItems > 0 ? "Needs Restock" : "All Good"
    },
    {
      title: "Out of Stock",
      value: outOfStockItems,
      icon: Package,
      color: outOfStockItems > 0 ? "text-red-600" : "text-green-600",
      bgColor: outOfStockItems > 0 ? "bg-red-50" : "bg-green-50",
      badge: outOfStockItems > 0 ? "Critical" : "All Good"
    }
  ];

  return (
    <div className="space-y-6 mb-8">
      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow duration-200 animate-fade-in">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <div className="flex items-center space-x-2">
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                      {stat.badge && (
                        <Badge 
                          variant={stat.value > 0 ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          {stat.badge}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <IconComponent className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
