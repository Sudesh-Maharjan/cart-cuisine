
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShoppingBag, Calendar, DollarSign } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="Total Orders" 
          value="0" 
          description="All time orders"
          icon={<ShoppingBag className="h-8 w-8 text-primary" />}
        />
        <DashboardCard 
          title="Total Revenue" 
          value="$0.00" 
          description="All time revenue"
          icon={<DollarSign className="h-8 w-8 text-primary" />}
        />
        <DashboardCard 
          title="Users" 
          value="0" 
          description="Registered users"
          icon={<Users className="h-8 w-8 text-primary" />}
        />
        <DashboardCard 
          title="Reservations" 
          value="0" 
          description="Pending reservations"
          icon={<Calendar className="h-8 w-8 text-primary" />}
        />
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No recent orders found.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Reservations</CardTitle>
            <CardDescription>Today's reservations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No upcoming reservations.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface DashboardCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, description, icon }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminDashboard;
