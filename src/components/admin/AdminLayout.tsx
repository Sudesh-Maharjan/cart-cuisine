
import React, { useEffect } from 'react';
import { useNavigate, Link, Outlet } from 'react-router-dom';
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
  LogOut
} from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    } else if (!isAdmin) {
      navigate('/');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-gray-900 text-white">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold">Restaurant Admin</h1>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <NavItem to="/admin/dashboard" icon={<LayoutDashboard size={18} />} text="Dashboard" />
          <NavItem to="/admin/categories" icon={<Menu size={18} />} text="Categories" />
          <NavItem to="/admin/menu-items" icon={<Pizza size={18} />} text="Menu Items" />
          <NavItem to="/admin/addons" icon={<Tag size={18} />} text="Addons" />
          <NavItem to="/admin/orders" icon={<Users size={18} />} text="Orders" />
          <NavItem to="/admin/reservations" icon={<Calendar size={18} />} text="Reservations" />
          <NavItem to="/admin/settings" icon={<Settings size={18} />} text="Settings" />
        </nav>
        <div className="p-4 border-t border-gray-800">
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
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden bg-gray-900 text-white p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Restaurant Admin</h1>
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="text-white hover:bg-gray-800"
          >
            <LogOut size={18} />
          </Button>
        </header>
        
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
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
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, text }) => {
  return (
    <Link
      to={to}
      className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-md transition-colors"
    >
      <span className="mr-3">{icon}</span>
      <span>{text}</span>
    </Link>
  );
};

export default AdminLayout;
