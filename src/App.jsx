import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Auth from './components/Auth';
import Home from './pages/Home';
import Services from './pages/Services';
import Bookings from './pages/Bookings';

const Shop = () => (
  <div className="min-h-screen pt-20 flex items-center justify-center">
    <div className="text-center">
      <h1 className="font-inter font-bold text-4xl text-text mb-4">Shop</h1>
      <p className="font-inter text-text/70">Coming soon...</p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <Navbar />
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/auth" element={<Auth />} />
            </Routes>
          </motion.main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;