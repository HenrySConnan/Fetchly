import { Heart, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white/80 backdrop-blur-xl border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-500 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-2xl text-gray-900">PetConnect</span>
            </div>
            <p className="text-gray-600 leading-relaxed max-w-md mb-8">
              Your trusted partner for all pet care needs. Book services, shop products, 
              and give your furry friends the love they deserve.
            </p>
            <div className="flex space-x-4">
              {['Privacy Policy', 'Terms of Service', 'Contact'].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-gray-500 hover:text-primary-600 transition-colors text-sm"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {['Services', 'Bookings', 'Shop', 'About Us', 'Careers'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-6">Contact</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary-600" />
                <span className="text-gray-600">hello@petconnect.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-600" />
                <span className="text-gray-600">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-primary-600" />
                <span className="text-gray-600">123 Pet Street, City</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © 2024 PetConnect. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-500 hover:text-primary-600 transition-colors text-sm">
              Privacy
            </a>
            <a href="#" className="text-gray-500 hover:text-primary-600 transition-colors text-sm">
              Terms
            </a>
            <a href="#" className="text-gray-500 hover:text-primary-600 transition-colors text-sm">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;