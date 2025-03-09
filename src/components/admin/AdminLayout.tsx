
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

interface NavItem {
  to: string;
  icon: LucideIcon;
  text: string;
}

const AdminLayout: React.FC = () => {
  const { isAuthenticated, isAdmin, logout, profile } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    <div className="flex h-screen overflow-hidden bg-gray-50">
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
        <header className="bg-white border-b border-gray-200 shadow-sm z-10">
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
            
            <h1 className="text-xl font-semibold md:ml-4">
              {getPageTitle()}
            </h1>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell size={20} />
                    <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>New order received</DropdownMenuItem>
                  <DropdownMenuItem>New reservation request</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-primary">
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
                      <p className="text-sm font-medium">
                        {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : 'Admin User'}
                      </p>
                      <p className="text-xs text-muted-foreground">Administrator</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
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
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
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
