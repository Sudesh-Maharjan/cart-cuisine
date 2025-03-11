
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import About from "./pages/About";
import Menu from "./pages/Menu";
import MenuCategory from "./pages/MenuCategory";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import OrderSuccess from "./pages/OrderSuccess";
import NotFound from "./pages/NotFound";
import Contact from "./pages/Contact";
import Reservation from "./pages/Reservation";
import Profile from "./pages/Profile";
import OrderHistory from "./pages/OrderHistory";

// Admin Pages
import AdminLogin from "./pages/admin/Login";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import Categories from "./pages/admin/Categories";
import MenuItems from "./pages/admin/MenuItems";
import Addons from "./pages/admin/Addons";
import Orders from "./pages/admin/Orders";
import Reservations from "./pages/admin/Reservations";
import Settings from "./pages/admin/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Customer routes */}
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/menu/:categoryId" element={<MenuCategory />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/order-history" element={<OrderHistory />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/reservation" element={<Reservation />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              
              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="categories" element={<Categories />} />
                <Route path="menu-items" element={<MenuItems />} />
                <Route path="addons" element={<Addons />} />
                <Route path="orders" element={<Orders />} />
                <Route path="reservations" element={<Reservations />} />
                <Route path="settings" element={<Settings />} />
                <Route index element={<AdminDashboard />} />
              </Route>
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
