import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar.jsx';
import MobileNav from './components/layout/MobileNav.jsx';
import Footer from './components/layout/Footer.jsx';
import ScrollToTop from './components/layout/ScrollToTop.jsx';
import CartDrawer from './components/cart/CartDrawer.jsx';
import ProtectedRoute from './components/routing/ProtectedRoute.jsx';

import Home from './pages/Home.jsx';
import Dishes from './pages/Dishes.jsx';
import DishDetail from './pages/DishDetail.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderConfirmation from './pages/OrderConfirmation.jsx';
import OrderTracking from './pages/OrderTracking.jsx';
import Profile from './pages/Profile.jsx';
import Admin from './pages/Admin.jsx';
import NotFound from './pages/NotFound.jsx';

/** Root layout + route table. */
const App = () => (
  <div className="flex min-h-screen flex-col">
    <ScrollToTop />
    <Navbar />
    <CartDrawer />

    {/* pb-20 leaves room for the mobile bottom nav. */}
    <main className="flex-1 pb-20 md:pb-0">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dishes" element={<Dishes />} />
        <Route path="/dishes/:id" element={<DishDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id/confirmation"
          element={
            <ProtectedRoute>
              <OrderConfirmation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id/track"
          element={
            <ProtectedRoute>
              <OrderTracking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <Admin />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>

    <Footer />
    <MobileNav />
  </div>
);

export default App;
