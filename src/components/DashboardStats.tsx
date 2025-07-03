
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Clock, TrendingDown, Activity } from 'lucide-react';

interface DashboardStatsProps {
  // These will be populated from backend API calls
  totalProducts?: number;
  expiringBatches?: number;
  outOfStockSKUs?: number;
  recentActivity?: Array<{
    id: string;
    action: string;
    product: string;
    date: string;
  }>;
  lastAddedProduct?: string;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalProducts = 0,
  expiringBatches = 0,
  outOfStockSKUs = 0,
  recentActivity = [],
  lastAddedProduct = "None"
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
      title: "Out of Stock",
      value: outOfStockSKUs,
      icon: TrendingDown,
      color: outOfStockSKUs > 0 ? "text-red-600" : "text-green-600",
      bgColor: outOfStockSKUs > 0 ? "bg-red-50" : "bg-green-50"
    }
  ];

  return (
    <div className="space-y-6 mb-8">
      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Activity Summary Card */}
      <Card className="hover:shadow-md transition-shadow duration-200 animate-fade-in">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Activity className="h-5 w-5 text-indigo-600" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Last Added Product:</span>
              <span className="font-medium text-gray-900">{lastAddedProduct}</span>
            </div>
            
            {recentActivity.length > 0 ? (
              <div className="space-y-2 pt-2 border-t">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Latest Actions</p>
                {recentActivity.slice(0, 3).map((activity, index) => (
                  <div key={activity.id} className="flex items-center justify-between text-sm py-1">
                    <span className="text-gray-700">
                      {activity.action}: <span className="font-medium">{activity.product}</span>
                    </span>
                    <span className="text-xs text-gray-500">{activity.date}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 pt-2 border-t">
                No recent activity to display
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
