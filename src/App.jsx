import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/layout/Navbar';
import MobileNav from './components/layout/MobileNav';
import Spinner from './components/ui/Spinner';

// Auth Pages
import LandingPage from './pages/auth/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

// Customer Pages
import HomePage from './pages/customer/HomePage';
import ShopPage from './pages/customer/ShopPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrdersPage from './pages/customer/OrdersPage';
import FavoritesPage from './pages/customer/FavoritesPage';
import ProfilePage from './pages/customer/ProfilePage';

// Shopkeeper Pages
import DashboardPage from './pages/shopkeeper/DashboardPage';
import ShopProfilePage from './pages/shopkeeper/ShopProfilePage';
import ProductsPage from './pages/shopkeeper/ProductsPage';
import ShopkeeperOrdersPage from './pages/shopkeeper/ShopkeeperOrdersPage';
import AnalyticsPage from './pages/shopkeeper/AnalyticsPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <main>{children}</main>
      <MobileNav />
    </div>
  );
}

function AppRoutes() {
  const { user, loading, isShopkeeper } = useAuth();

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spinner size="lg" /></div>;

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={user ? <Navigate to={isShopkeeper ? '/dashboard' : '/home'} replace /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to={isShopkeeper ? '/dashboard' : '/home'} replace /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to={isShopkeeper ? '/dashboard' : '/home'} replace /> : <SignupPage />} />

      {/* Customer */}
      <Route path="/home" element={<ProtectedRoute><AppLayout><HomePage /></AppLayout></ProtectedRoute>} />
      <Route path="/shop/:id" element={<ProtectedRoute><AppLayout><ShopPage /></AppLayout></ProtectedRoute>} />
      <Route path="/cart" element={<ProtectedRoute><AppLayout><CartPage /></AppLayout></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute><AppLayout><CheckoutPage /></AppLayout></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><AppLayout><OrdersPage /></AppLayout></ProtectedRoute>} />
      <Route path="/favorites" element={<ProtectedRoute><AppLayout><FavoritesPage /></AppLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />

      {/* Shopkeeper */}
      <Route path="/dashboard" element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
      <Route path="/dashboard/shop" element={<ProtectedRoute><AppLayout><ShopProfilePage /></AppLayout></ProtectedRoute>} />
      <Route path="/dashboard/products" element={<ProtectedRoute><AppLayout><ProductsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/dashboard/orders" element={<ProtectedRoute><AppLayout><ShopkeeperOrdersPage /></AppLayout></ProtectedRoute>} />
      <Route path="/dashboard/analytics" element={<ProtectedRoute><AppLayout><AnalyticsPage /></AppLayout></ProtectedRoute>} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <AppRoutes />
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: { borderRadius: '12px', padding: '12px 16px', fontSize: '14px', fontFamily: 'Inter, sans-serif' },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
