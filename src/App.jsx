import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import { useUserType } from './hooks/useUserType';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Auth from './components/Auth';
import Home from './pages/Home';
import ServicesNew from './pages/ServicesNew';
import BusinessServicesPage from './pages/BusinessServicesPage';
import BookingFlow from './pages/BookingFlow';
import Deals from './pages/Deals';
import ServicePackages from './pages/ServicePackages';
import Dashboard from './pages/Dashboard';
import BusinessDashboard from './pages/BusinessDashboard';
import BusinessUpgrade from './pages/BusinessUpgrade';
import SimpleAdminDashboard from './pages/SimpleAdminDashboard';
import Waitlist from './pages/Waitlist';

const Shop = () => (
  <div className="min-h-screen pt-20 flex items-center justify-center">
    <div className="text-center">
      <h1 className="font-inter font-bold text-4xl text-text mb-4">Shop</h1>
      <p className="font-inter text-text/70">Coming soon...</p>
    </div>
  </div>
);

function AppContent() {
  const location = useLocation();
  const { userType, isLoading } = useUserType();
  const isAdminPage = location.pathname === '/admin';
  const isBusinessPage = location.pathname === '/business';

  // Show loading while determining user type
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {!isAdminPage && <Navbar />}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={!isAdminPage ? "pb-20 md:pb-0" : ""}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={
            userType === 'business' ? <Navigate to="/business" replace /> :
            <ServicesNew />
          } />
          <Route path="/business/:businessId" element={
            userType === 'business' ? <Navigate to="/business" replace /> :
            <BusinessServicesPage />
          } />
          <Route path="/booking/:businessId/:serviceId" element={
            userType === 'business' ? <Navigate to="/business" replace /> :
            <BookingFlow />
          } />
          <Route path="/deals" element={
            userType === 'business' ? <Navigate to="/business" replace /> :
            <Deals />
          } />
          <Route path="/packages" element={
            userType === 'business' ? <Navigate to="/business" replace /> :
            <ServicePackages />
          } />
          <Route path="/waitlist" element={
            userType === 'business' ? <Navigate to="/business" replace /> :
            <Waitlist />
          } />
          <Route path="/shop" element={
            userType === 'business' ? <Navigate to="/business" replace /> :
            <Shop />
          } />
          <Route path="/dashboard" element={
            userType === 'admin' ? <Navigate to="/admin" replace /> :
            userType === 'business' ? <Navigate to="/business" replace /> :
            <Dashboard />
          } />
          <Route path="/business" element={
            userType === 'admin' ? <Navigate to="/admin" replace /> :
            userType === 'business' ? <BusinessDashboard /> :
            <Navigate to="/business-upgrade" replace />
          } />
          <Route path="/business-upgrade" element={<BusinessUpgrade />} />
          <Route path="/admin" element={
            userType === 'admin' ? <SimpleAdminDashboard /> :
            <Navigate to="/" replace />
          } />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </motion.main>
      {!isAdminPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;