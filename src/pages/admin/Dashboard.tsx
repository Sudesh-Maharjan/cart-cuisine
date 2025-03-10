
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
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [upcomingReservations, setUpcomingReservations] = useState<any[]>([]);
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
        
        // Get monthly sales data
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          
          const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
          const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
          
          const { data: monthOrders, error: monthError } = await supabase
            .from('orders')
            .select('total_amount')
            .gte('created_at', startOfMonth.toISOString())
            .lte('created_at', endOfMonth.toISOString());
          
          if (monthError) throw monthError;
          
          const monthlyRevenue = monthOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
          
          last6Months.push({
            month: date.toLocaleString('default', { month: 'short' }),
            revenue: monthlyRevenue
          });
        }
        
        setMonthlySales(last6Months);
        
        // Get recent orders
        const { data: recentOrdersData, error: recentOrdersError } = await supabase
          .from('orders')
          .select('id, total_amount, status, created_at, user_id')
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (recentOrdersError) throw recentOrdersError;
        setRecentOrders(recentOrdersData || []);
        
        // Get upcoming reservations
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { data: reservationsData, error: upcomingResError } = await supabase
          .from('reservations')
          .select('id, name, date, time, guests, status')
          .gte('date', today.toISOString().split('T')[0])
          .order('date', { ascending: true })
          .order('time', { ascending: true })
          .limit(5);
        
        if (upcomingResError) throw upcomingResError;
        setUpcomingReservations(reservationsData || []);
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
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>
      
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
        <Card className="bg-gray-800 text-white border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Monthly Sales
            </CardTitle>
            <CardDescription className="text-gray-400">Revenue over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse bg-gray-700 w-full h-full rounded-lg"></div>
                </div>
              ) : (
                <Line data={monthlySalesChartData} options={chartOptions} />
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 text-white border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Top Selling Items
            </CardTitle>
            <CardDescription className="text-gray-400">Most popular menu items by quantity sold</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse bg-gray-700 w-full h-full rounded-lg"></div>
                </div>
              ) : topSellingItems.length > 0 ? (
                <Bar data={topSellingItemsChartData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No sales data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-800 text-white border-gray-700">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription className="text-gray-400">Latest customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-5 bg-gray-700 rounded w-1/3"></div>
                    <div className="h-5 bg-gray-700 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex justify-between items-center p-2 hover:bg-gray-700 rounded">
                    <div>
                      <p className="text-sm font-medium">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(order.total_amount)}</p>
                      <p className={`text-xs ${
                        order.status === 'completed' ? 'text-green-400' : 
                        order.status === 'pending' ? 'text-yellow-400' : 'text-gray-400'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No recent orders found.</p>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 text-white border-gray-700">
          <CardHeader>
            <CardTitle>Upcoming Reservations</CardTitle>
            <CardDescription className="text-gray-400">Today's reservations</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-5 bg-gray-700 rounded w-1/3"></div>
                    <div className="h-5 bg-gray-700 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : upcomingReservations.length > 0 ? (
              <div className="space-y-3">
                {upcomingReservations.map((reservation) => (
                  <div key={reservation.id} className="flex justify-between items-center p-2 hover:bg-gray-700 rounded">
                    <div>
                      <p className="text-sm font-medium">{reservation.name}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(reservation.date).toLocaleDateString()} at {reservation.time}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{reservation.guests} guests</p>
                      <p className={`text-xs ${
                        reservation.status === 'confirmed' ? 'text-green-400' : 
                        reservation.status === 'pending' ? 'text-yellow-400' : 'text-gray-400'
                      }`}>
                        {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No upcoming reservations.</p>
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
    <Card className="bg-gray-800 text-white border-gray-700">
      <CardContent className="pt-6">
        {loading ? (
          <div className="animate-pulse flex items-center justify-between">
            <div>
              <div className="h-5 bg-gray-700 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-700 rounded w-16 mb-1"></div>
              <div className="h-4 bg-gray-700 rounded w-32"></div>
            </div>
            <div className="h-8 w-8 bg-gray-700 rounded-full"></div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">{title}</p>
              <p className="text-3xl font-bold text-white">{value}</p>
              <p className="text-xs text-gray-400 mt-1">{description}</p>
            </div>
            {icon}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminDashboard;
