import { motion } from 'framer-motion';
import { Calendar, ShoppingBag, MapPin, ArrowRight, Star, Heart, Sparkles, Percent, Timer, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const features = [
    {
      icon: Calendar,
      title: 'Book Services',
      description: 'Schedule vet visits, grooming, and dog walking with trusted professionals.',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: ShoppingBag,
      title: 'Shop Products',
      description: 'Discover premium pet products, food, toys, and accessories.',
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      icon: MapPin,
      title: 'Track Bookings',
      description: 'Monitor appointments and get real-time updates on services.',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Happy Pets', icon: Heart },
    { number: '500+', label: 'Expert Vets', icon: Star },
    { number: '50+', label: 'Cities', icon: MapPin },
    { number: '4.9', label: 'Rating', icon: Star }
  ];

  const featuredDeals = [
    {
      id: 1,
      title: 'New Pet Owner Package',
      description: 'Complete care package for your new furry friend',
      originalPrice: 299,
      discountedPrice: 199,
      discount: 33,
      validUntil: '2024-02-15',
      isLimited: true
    },
    {
      id: 2,
      title: 'Monthly Grooming Subscription',
      description: 'Professional grooming every month with premium care',
      originalPrice: 120,
      discountedPrice: 89,
      discount: 26,
      validUntil: '2024-03-01',
      isLimited: false
    },
    {
      id: 3,
      title: 'First-Time Customer Special',
      description: 'Welcome to PetConnect! Get 30% off your first service',
      originalPrice: 100,
      discountedPrice: 70,
      discount: 30,
      validUntil: '2024-03-15',
      isLimited: false
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-4 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center space-x-2 bg-primary-50 text-primary-600 px-4 py-2 rounded-full text-sm font-medium mb-8"
            >
              <Sparkles className="w-4 h-4" />
              <span>Trusted by 10,000+ pet owners</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Care for Your
              <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent block">
                Furry Friends
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              Book professional pet services and shop premium products all in one place. 
              Your pets deserve the best care.
            </motion.p>
          </motion.div>
        </div>

        {/* Background Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-100 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-100 rounded-full blur-3xl opacity-60"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-4">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="glass-card rounded-2xl p-8 group cursor-pointer"
              >
                <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-8 h-8 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`} />
                </div>
                
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed mb-6">
                  {feature.description}
                </p>

                <Link
                  to={feature.title === 'Book Services' ? '/services' : feature.title === 'Shop Products' ? '/shop' : '/bookings'}
                  className="inline-flex items-center space-x-2 text-primary-600 font-medium hover:text-primary-700 transition-colors"
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything Your Pet Needs
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From professional services to premium products, we've got your pet covered.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <stat.icon className="w-6 h-6 text-primary-600" />
                  <span className="text-4xl font-bold text-gray-900">{stat.number}</span>
                </div>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Deals Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center mr-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                Exclusive
                <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent block">
                  Pet Deals
                </span>
              </h2>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Save big on premium pet care services. Limited-time offers you won't want to miss!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
          >
            {featuredDeals.map((deal, index) => (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="glass-card rounded-2xl overflow-hidden group cursor-pointer relative"
              >
                {/* Deal Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
                    <Percent className="w-3 h-3" />
                    <span>{deal.discount}% OFF</span>
                  </div>
                </div>

                {/* Limited Badge */}
                {deal.isLimited && (
                  <div className="absolute top-4 left-4 z-10">
                    <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
                      <Timer className="w-3 h-3" />
                      <span>LIMITED</span>
                    </div>
                  </div>
                )}

                {/* Deal Content */}
                <div className="p-6">
                  <div className="h-32 bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center mb-6 rounded-xl">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                      <Tag className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">{deal.title}</h3>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">{deal.description}</p>

                  {/* Pricing */}
                  <div className="mb-6">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl font-bold text-primary-600">${deal.discountedPrice}</span>
                      <span className="text-lg text-gray-400 line-through">${deal.originalPrice}</span>
                    </div>
                    <p className="text-sm text-gray-500">You save ${deal.originalPrice - deal.discountedPrice}</p>
                  </div>

                  {/* Expiry */}
                  <div className="flex items-center space-x-2 text-red-600 mb-6">
                    <Timer className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Expires {new Date(deal.validUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  {/* Claim Button */}
                  <Link 
                    to="/deals"
                    className="w-full btn-primary group-hover:scale-105 transition-transform duration-300 flex items-center justify-center space-x-2"
                  >
                    <span>Claim Deal</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link 
              to="/deals"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-accent-500 text-white px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-all duration-300 hover:shadow-lg"
            >
              <span>View All Deals</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary-600 to-accent-500 rounded-3xl p-12 text-center text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-6">
                Ready to Give Your Pet the Best?
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Join thousands of pet owners who trust us with their furry family members.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/services" className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 hover:scale-105 hover:shadow-lg inline-flex items-center space-x-2">
                  <span>Browse Services</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/shop" className="bg-white/20 backdrop-blur-xl text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 hover:scale-105 border border-white/30 inline-flex items-center space-x-2">
                  <ShoppingBag className="w-5 h-5" />
                  <span>Shop Now</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;