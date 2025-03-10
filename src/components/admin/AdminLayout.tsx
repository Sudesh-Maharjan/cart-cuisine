
import React, { useEffect, useState } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Menu, 
  Tag, 
  Pizza, 
  Users, 
  Calendar, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  LucideIcon,
  ShoppingBag,
  Bell,
  User
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NavItem {
  to: string;
  icon: LucideIcon;
  text: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const AdminLayout: React.FC = () => {
  const { isAuthenticated, isAdmin, logout, profile } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    } else if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges.",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [isAuthenticated, isAdmin, navigate, toast]);
  
  useEffect(() => {
    // Close mobile menu when route changes
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    // Set up fake notifications for demo
    const demoNotifications: Notification[] = [
      {
        id: '1',
        title: 'Welcome',
        message: 'Welcome to the admin dashboard',
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    setNotifications(demoNotifications);
    updateUnreadCount(demoNotifications);
    
    // Set up real-time listener for orders
    const channel = supabase
      .channel('admin-notifications')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'orders' 
        }, 
        (payload) => {
          console.log('New order notification:', payload);
          
          const newNotification: Notification = {
            id: payload.new.id,
            title: 'New Order',
            message: `New order #${payload.new.id.slice(0, 8)}... has been placed`,
            isRead: false,
            createdAt: new Date().toISOString()
          };
          
          setNotifications(prev => [newNotification, ...prev]);
          updateUnreadCount([newNotification, ...notifications]);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const updateUnreadCount = (notifs: Notification[]) => {
    const count = notifs.filter(n => !n.isRead).length;
    setUnreadCount(count);
  };
  
  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updatedNotifications);
    setUnreadCount(0);
  };
  
  const markAsRead = (id: string) => {
    const updatedNotifications = notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    );
    setNotifications(updatedNotifications);
    updateUnreadCount(updatedNotifications);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };
  
  // Format current page name for header
  const getPageTitle = () => {
    const path = location.pathname.split('/').pop() || 'dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
  };

  if (!isAuthenticated || !isAdmin) {
    return null;
  }
  
  const navItems: NavItem[] = [
    { to: "/admin/dashboard", icon: LayoutDashboard, text: "Dashboard" },
    { to: "/admin/categories", icon: Menu, text: "Categories" },
    { to: "/admin/menu-items", icon: Pizza, text: "Menu Items" },
    { to: "/admin/addons", icon: Tag, text: "Addons" },
    { to: "/admin/orders", icon: ShoppingBag, text: "Orders" },
    { to: "/admin/reservations", icon: Calendar, text: "Reservations" },
    { to: "/admin/settings", icon: Settings, text: "Settings" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div 
        className={`${
          collapsed ? 'w-16' : 'w-64'
        } hidden md:flex flex-col bg-gray-900 text-white transition-all duration-300 ease-in-out relative`}
      >
        <div className={`p-4 border-b border-gray-800 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && <h1 className="text-xl font-bold">Savoria Admin</h1>}
          <Button 
            variant="ghost" 
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-gray-800 absolute right-2"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => (
            <NavItem 
              key={item.to} 
              to={item.to} 
              icon={<item.icon size={collapsed ? 22 : 18} />} 
              text={item.text} 
              collapsed={collapsed}
              active={location.pathname === item.to || 
                (item.to !== '/admin/dashboard' && location.pathname.startsWith(item.to))}
            />
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-800">
          <Button 
            variant="ghost" 
            className={`w-full ${collapsed ? 'justify-center px-0' : 'justify-start'} text-white hover:bg-gray-800`}
            onClick={handleLogout}
          >
            <LogOut size={collapsed ? 22 : 18} className={collapsed ? '' : 'mr-2'} />
            {!collapsed && "Logout"}
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm z-10">
          <div className="flex justify-between items-center px-4 py-3">
            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu size={20} />
            </Button>
            
            <h1 className="text-xl font-semibold md:ml-4 dark:text-white">
              {getPageTitle()}
            </h1>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 dark:bg-gray-800 dark:text-white">
                  <div className="flex justify-between items-center p-2">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    {unreadCount > 0 && (
                      <Button variant="link" size="sm" onClick={markAllAsRead} className="text-primary h-6">
                        Mark all as read
                      </Button>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(notification => (
                        <DropdownMenuItem 
                          key={notification.id}
                          className={`cursor-pointer p-3 ${notification.isRead ? '' : 'bg-muted/20'}`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex flex-col space-y-1 w-full">
                            <div className="flex justify-between items-start">
                              <span className="font-medium">{notification.title}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(notification.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                            <span className="text-sm text-muted-foreground">{notification.message}</span>
                          </div>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        No notifications
                      </div>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-primary justify-center">
                    View all notifications
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatar.png" />
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {profile?.first_name?.charAt(0) || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium dark:text-white">
                        {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : 'Admin User'}
                      </p>
                      <p className="text-xs text-muted-foreground">Administrator</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:text-white">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User size={16} className="mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                    <Settings size={16} className="mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-gray-900 bg-opacity-50 z-20">
            <div className="h-full w-64 bg-gray-900 text-white p-4 overflow-y-auto animate-slide-in-left">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold">Savoria Admin</h1>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-gray-400 hover:text-white hover:bg-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ChevronLeft size={18} />
                </Button>
              </div>
              
              <nav className="space-y-1 mb-6">
                {navItems.map((item) => (
                  <NavItem 
                    key={item.to} 
                    to={item.to} 
                    icon={<item.icon size={18} />} 
                    text={item.text} 
                    collapsed={false}
                    active={location.pathname === item.to || 
                      (item.to !== '/admin/dashboard' && location.pathname.startsWith(item.to))}
                  />
                ))}
              </nav>
              
              <div className="pt-4 border-t border-gray-800">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-white hover:bg-gray-800"
                  onClick={handleLogout}
                >
                  <LogOut size={18} className="mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  text: string;
  collapsed: boolean;
  active: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, text, collapsed, active }) => {
  return (
    <Link
      to={to}
      className={`flex items-center ${
        collapsed ? 'justify-center' : 'px-4'
      } py-3 ${
        active 
          ? 'bg-gray-800 text-white' 
          : 'text-gray-300 hover:bg-gray-800'
      } rounded-md transition-colors`}
    >
      <span className={collapsed ? '' : 'mr-3'}>{icon}</span>
      {!collapsed && <span>{text}</span>}
    </Link>
  );
};

export default AdminLayout;
