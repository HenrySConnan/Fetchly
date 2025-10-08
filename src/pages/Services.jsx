import { motion } from 'framer-motion';
import { Stethoscope, Scissors, Footprints, Clock, Star, MapPin, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Services = () => {
  const services = [
    {
      id: 1,
      title: 'Veterinary Care',
      description: 'Professional medical care for your pets with experienced veterinarians.',
      icon: Stethoscope,
      price: 'From $50',
      duration: '30-60 min',
      rating: 4.9,
      reviews: 1247,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      features: ['Health Checkups', 'Vaccinations', 'Emergency Care', 'Surgery']
    },
    {
      id: 2,
      title: 'Pet Grooming',
      description: 'Professional grooming services to keep your pets clean and healthy.',
      icon: Scissors,
      price: 'From $35',
      duration: '45-90 min',
      rating: 4.8,
      reviews: 892,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      features: ['Bath & Dry', 'Nail Trimming', 'Hair Styling', 'Teeth Cleaning']
    },
    {
      id: 3,
      title: 'Dog Walking',
      description: 'Regular exercise and outdoor time for your dogs with trusted walkers.',
      icon: Footprints,
      price: 'From $25',
      duration: '30-60 min',
      rating: 4.7,
      reviews: 634,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      features: ['Daily Walks', 'Exercise', 'Socialization', 'GPS Tracking']
    }
  ];

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Professional
              <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent block">
                Pet Services
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Book trusted professionals for all your pet care needs. 
              Quality service guaranteed.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="glass-card rounded-2xl overflow-hidden group cursor-pointer"
              >
                {/* Service Header */}
                <div className={`h-48 ${service.bgColor} flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                  <div className="relative z-10 text-center">
                    <div className={`w-20 h-20 ${service.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                      <service.icon className={`w-10 h-10 bg-gradient-to-r ${service.color} bg-clip-text text-transparent`} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {service.title}
                    </h3>
                  </div>
                </div>

                {/* Service Content */}
                <div className="p-8">
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Service Details */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium">Price</span>
                      <span className="text-2xl font-bold text-primary-600">{service.price}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium">Duration</span>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700 font-medium">{service.duration}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium">Rating</span>
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-gray-700 font-medium">{service.rating}</span>
                        <span className="text-gray-400">({service.reviews})</span>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-900 mb-4">What's Included:</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {service.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Book Now Button */}
                  <Link 
                    to="/bookings"
                    className="w-full btn-primary flex items-center justify-center space-x-2 group"
                  >
                    <span>Book Now</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
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
                Ready to Book a Service?
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Join thousands of pet owners who trust us with their furry family members.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link 
                  to="/bookings"
                  className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center space-x-2"
                >
                  <span>Browse Services</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <button className="bg-white/20 backdrop-blur-xl text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 hover:scale-105 border border-white/30">
                  Contact Us
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Services;