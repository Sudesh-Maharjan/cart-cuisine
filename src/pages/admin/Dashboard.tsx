
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShoppingBag, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  pendingReservations: number;
}

interface TopSellingItem {
  name: string;
  count: number;
}

interface MonthlySales {
  month: string;
  revenue: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    pendingReservations: 0
  });
  const [topSellingItems, setTopSellingItems] = useState<TopSellingItem[]>([]);
  const [monthlySales, setMonthlySales] = useState<MonthlySales[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Get total orders
        const { count: ordersCount, error: ordersError } = await supabase
          .from('orders')
          .select('*', { count: 'exact' });
          
        if (ordersError) throw ordersError;
        
        // Get total revenue
        const { data: revenueData, error: revenueError } = await supabase
          .from('orders')
          .select('total_amount');
          
        if (revenueError) throw revenueError;
        
        const totalRevenue = revenueData.reduce((sum, order) => sum + Number(order.total_amount), 0);
        
        // Get total users
        const { count: usersCount, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact' });
          
        if (usersError) throw usersError;
        
        // Get pending reservations
        const { count: reservationsCount, error: reservationsError } = await supabase
          .from('reservations')
          .select('*', { count: 'exact' })
          .eq('status', 'pending');
          
        if (reservationsError) throw reservationsError;
        
        // Set stats
        setStats({
          totalOrders: ordersCount || 0,
          totalRevenue,
          totalUsers: usersCount || 0,
          pendingReservations: reservationsCount || 0
        });
        
        // Get top selling items
        const { data: orderItems, error: orderItemsError } = await supabase
          .from('order_items')
          .select('item_id, quantity');
          
        if (orderItemsError) throw orderItemsError;
        
        // Count quantities by item_id
        const itemCounts: {[key: string]: number} = {};
        orderItems.forEach(item => {
          if (!item.item_id) return;
          itemCounts[item.item_id] = (itemCounts[item.item_id] || 0) + item.quantity;
        });
        
        // Get item details for the top items
        const itemIds = Object.keys(itemCounts);
        if (itemIds.length > 0) {
          const { data: menuItems, error: menuItemsError } = await supabase
            .from('menu_items')
            .select('id, name')
            .in('id', itemIds);
            
          if (menuItemsError) throw menuItemsError;
          
          // Map counts to names and sort by count descending
          const topItems = menuItems.map(item => ({
            name: item.name,
            count: itemCounts[item.id] || 0
          })).sort((a, b) => b.count - a.count).slice(0, 5);
          
          setTopSellingItems(topItems);
        }
        
        // Generate monthly sales data (for demo, since we might not have enough real data)
        const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          return {
            month: date.toLocaleString('default', { month: 'short' }),
            revenue: Math.floor(Math.random() * 10000) + 1000 // Random revenue for demo
          };
        }).reverse();
        
        setMonthlySales(lastSixMonths);
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: 'Error',
          description: `Failed to load dashboard data: ${error.message}`,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
    
    // Set up real-time listener for changes
    const ordersChannel = supabase
      .channel('dashboard-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' }, 
        () => {
          // Refresh dashboard data when orders change
          fetchDashboardData();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(ordersChannel);
    };
  }, [toast]);
  
  const monthlySalesChartData = {
    labels: monthlySales.map(item => item.month),
    datasets: [
      {
        label: 'Monthly Revenue',
        data: monthlySales.map(item => item.revenue),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };
  
  const topSellingItemsChartData = {
    labels: topSellingItems.map(item => item.name),
    datasets: [
      {
        label: 'Items Sold',
        data: topSellingItems.map(item => item.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(156, 163, 175)'
        }
      }
    },
    scales: {
      y: {
        ticks: {
          color: 'rgb(156, 163, 175)'
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        }
      },
      x: {
        ticks: {
          color: 'rgb(156, 163, 175)'
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold dark:text-white">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="Total Orders" 
          value={stats.totalOrders.toString()} 
          description="All time orders"
          icon={<ShoppingBag className="h-8 w-8 text-primary" />}
          loading={isLoading}
        />
        <DashboardCard 
          title="Total Revenue" 
          value={formatCurrency(stats.totalRevenue)} 
          description="All time revenue"
          icon={<DollarSign className="h-8 w-8 text-primary" />}
          loading={isLoading}
        />
        <DashboardCard 
          title="Users" 
          value={stats.totalUsers.toString()} 
          description="Registered users"
          icon={<Users className="h-8 w-8 text-primary" />}
          loading={isLoading}
        />
        <DashboardCard 
          title="Reservations" 
          value={stats.pendingReservations.toString()} 
          description="Pending reservations"
          icon={<Calendar className="h-8 w-8 text-primary" />}
          loading={isLoading}
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="dark:bg-gray-800 dark:text-white border-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Monthly Sales
            </CardTitle>
            <CardDescription className="dark:text-gray-400">Revenue over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse bg-gray-300 dark:bg-gray-700 w-full h-full rounded-lg"></div>
                </div>
              ) : (
                <Line data={monthlySalesChartData} options={chartOptions} />
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="dark:bg-gray-800 dark:text-white border-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Top Selling Items
            </CardTitle>
            <CardDescription className="dark:text-gray-400">Most popular menu items by quantity sold</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse bg-gray-300 dark:bg-gray-700 w-full h-full rounded-lg"></div>
                </div>
              ) : topSellingItems.length > 0 ? (
                <Bar data={topSellingItemsChartData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No sales data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="dark:bg-gray-800 dark:text-white border-border">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription className="dark:text-gray-400">Latest customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
                    <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No recent orders found.</p>
            )}
          </CardContent>
        </Card>
        
        <Card className="dark:bg-gray-800 dark:text-white border-border">
          <CardHeader>
            <CardTitle>Upcoming Reservations</CardTitle>
            <CardDescription className="dark:text-gray-400">Today's reservations</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
                    <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No upcoming reservations.</p>
            )}
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
  loading?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, description, icon, loading = false }) => {
  return (
    <Card className="dark:bg-gray-800 dark:text-white border-border">
      <CardContent className="pt-6">
        {loading ? (
          <div className="animate-pulse flex items-center justify-between">
            <div>
              <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-16 mb-1"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
            </div>
            <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">{title}</p>
              <p className="text-3xl font-bold dark:text-white">{value}</p>
              <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">{description}</p>
            </div>
            {icon}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminDashboard;
