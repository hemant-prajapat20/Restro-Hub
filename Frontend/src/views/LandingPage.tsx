import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Building2, 
  ChefHat, 
  LineChart, 
  Smartphone, 
  Users,
  UtensilsCrossed,
  ArrowRight,
  CheckCircle2,
  MenuSquare,
  X,
  Star,
  Quote,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  MapPin,
  Mail,
  Phone
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <UtensilsCrossed className="w-8 h-8 text-brand-accent" />,
      title: 'Advanced POS',
      description: 'Lightning-fast order entry with custom floor plans, split billing, and offline mode support.'
    },
    {
      icon: <ChefHat className="w-8 h-8 text-brand-accent" />,
      title: 'Live KDS',
      description: 'Connect front-of-house to the kitchen instantly. Track prep times and manage tickets digitally.'
    },
    {
      icon: <LineChart className="w-8 h-8 text-brand-accent" />,
      title: 'Deep Analytics',
      description: 'Real-time sales tracking, inventory forecasting, and staff performance metrics at a glance.'
    },
    {
      icon: <Smartphone className="w-8 h-8 text-brand-accent" />,
      title: 'Table-Side Ordering',
      description: 'Empower staff with mobile ordering and payments to turn tables up to 20% faster.'
    }
  ];

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    if (id === 'contact') {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-brand-accent/30 text-gray-800">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[#F8FAFC]/95 backdrop-blur-md shadow-lg py-4 border-b border-gray-200' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-shrink-0 cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <img 
                src="/logo.png" 
                alt="Dine & Dusk" 
                className="h-12 w-auto object-contain"
                style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.6)) drop-shadow(0px 0px 10px rgba(0,0,0,0.2))' }}
              />
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-2">
              <button onClick={() => scrollToSection('features')} className={`font-medium transition-all px-4 py-2 rounded-lg ${activeSection === 'features' ? 'bg-brand-accent text-white' : 'text-gray-600 hover:text-brand-accent'}`}>Features</button>
              <button onClick={() => scrollToSection('services')} className={`font-medium transition-all px-4 py-2 rounded-lg ${activeSection === 'services' ? 'bg-brand-accent text-white' : 'text-gray-600 hover:text-brand-accent'}`}>Services</button>
              <button onClick={() => scrollToSection('about')} className={`font-medium transition-all px-4 py-2 rounded-lg ${activeSection === 'about' ? 'bg-brand-accent text-white' : 'text-gray-600 hover:text-brand-accent'}`}>About Us</button>
              <button onClick={() => scrollToSection('contact')} className={`font-medium transition-all px-4 py-2 rounded-lg ${activeSection === 'contact' ? 'bg-brand-accent text-white' : 'text-gray-600 hover:text-brand-accent'}`}>Contact</button>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login" className="text-gray-700 font-bold hover:text-brand-accent transition-colors px-4 py-2">
                Log In
              </Link>
              <Link to="/register" className="bg-brand-accent text-white font-bold px-6 py-2.5 rounded-xl hover:bg-brand-primary transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                Sign Up Free
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-700 focus:outline-none">
                {isMobileMenuOpen ? <X className="w-8 h-8" /> : <MenuSquare className="w-8 h-8" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden absolute top-full left-0 w-full bg-[#F8FAFC] shadow-xl border-t border-gray-200 py-4 px-4 flex flex-col space-y-4"
          >
            <button onClick={() => scrollToSection('features')} className={`text-left font-medium text-lg px-4 py-2 rounded-lg transition-colors ${activeSection === 'features' ? 'bg-brand-accent text-white' : 'text-gray-700 hover:bg-gray-100'}`}>Features</button>
            <button onClick={() => scrollToSection('services')} className={`text-left font-medium text-lg px-4 py-2 rounded-lg transition-colors ${activeSection === 'services' ? 'bg-brand-accent text-white' : 'text-gray-700 hover:bg-gray-100'}`}>Services</button>
            <button onClick={() => scrollToSection('about')} className={`text-left font-medium text-lg px-4 py-2 rounded-lg transition-colors ${activeSection === 'about' ? 'bg-brand-accent text-white' : 'text-gray-700 hover:bg-gray-100'}`}>About Us</button>
            <button onClick={() => scrollToSection('contact')} className={`text-left font-medium text-lg px-4 py-2 rounded-lg transition-colors ${activeSection === 'contact' ? 'bg-brand-accent text-white' : 'text-gray-700 hover:bg-gray-100'}`}>Contact</button>
            <div className="border-t border-gray-200 my-2 pt-4 flex flex-col space-y-3">
              <Link to="/login" className="text-center text-gray-700 font-bold border border-gray-300 py-3 rounded-xl">Log In</Link>
              <Link to="/register" className="text-center bg-brand-accent text-white font-bold py-3 rounded-xl shadow-md">Sign Up Free</Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-8 lg:pt-32 lg:pb-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-30 pointer-events-none">
          <div className="absolute top-20 -left-20 w-72 h-72 bg-brand-accent rounded-full filter blur-[100px] opacity-20"></div>
          <div className="absolute top-40 -right-20 w-72 h-72 bg-brand-accent rounded-full filter blur-[100px] opacity-20"></div>
          <div className="absolute -bottom-20 left-40 w-72 h-72 bg-emerald-400 rounded-full filter blur-[100px] opacity-10"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mt-4">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div initial="hidden" animate="visible" variants={fadeIn}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-tight tracking-tighter mb-8 drop-shadow-sm">
                Scale Your Restaurant. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C5A059] to-[#e2c07a]">
                  Simplify Operations.
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-500 mb-10 leading-relaxed font-medium">
                Dine & Dusk is the ultimate all-in-one management platform designed to help modern restaurants, cafes, and bars thrive in a fast-paced industry.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <button 
                  onClick={() => navigate('/register')}
                  className="w-full sm:w-auto bg-brand-accent text-white font-bold text-lg px-8 py-4 rounded-2xl hover:bg-brand-primary transition-all shadow-[0_8px_30px_rgb(228,161,27,0.2)] hover:shadow-[0_8px_30px_rgb(228,161,27,0.4)] transform hover:-translate-y-1 flex items-center justify-center group"
                >
                  Start Your Free Trial
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => scrollToSection('features')}
                  className="w-full sm:w-auto bg-transparent text-gray-700 font-bold text-lg px-8 py-4 rounded-2xl border-2 border-gray-300 hover:border-brand-accent hover:text-brand-accent transition-all flex items-center justify-center"
                >
                  Explore Features
                </button>
              </div>
              
              <div className="mt-12 flex items-center justify-center space-x-8 text-sm font-medium text-gray-500">
                <div className="flex items-center"><CheckCircle2 className="w-5 h-5 text-brand-accent mr-2" /> No credit card required</div>
                <div className="flex items-center"><CheckCircle2 className="w-5 h-5 text-brand-accent mr-2" /> 14-day free trial</div>
                <div className="flex items-center"><CheckCircle2 className="w-5 h-5 text-brand-accent mr-2" /> Cancel anytime</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="pt-8 pb-12 lg:pt-10 lg:pb-16 bg-[#F8FAFC] border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Everything You Need to Succeed</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Powerful tools seamlessly integrated into one platform to eliminate friction between your front-of-house and kitchen.
            </p>
          </div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                variants={fadeIn}
                className="bg-white rounded-3xl p-8 shadow-sm transition-all duration-300 border border-gray-100 hover:border-brand-accent/40 hover:shadow-md group"
              >
                <div className="w-16 h-16 bg-brand-accent/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-12 lg:py-16 bg-[#F8FAFC] border-t border-gray-100 relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute inset-0 opacity-5">
          <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="black" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 leading-tight">
                Built for <span className="text-brand-accent">Any Concept.</span><br />
                Tailored for Yours.
              </h2>
              <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                Whether you run a high-volume fine dining establishment, a bustling cafe, or a multi-location franchise, our modular system adapts perfectly to your workflow.
              </p>
              
              <div className="space-y-6">
                {[
                  { icon: <Building2 className="w-6 h-6 text-brand-accent" />, title: 'Fine Dining & Full Service', desc: 'Complex course management, reservation integrations, and elegant table-side service.' },
                  { icon: <Users className="w-6 h-6 text-brand-accent" />, title: 'Cafes & Quick Service', desc: 'Rapid checkout flows, customer displays, and robust loyalty programs.' }
                ].map((item, i) => (
                  <div key={i} className="flex p-6 bg-white rounded-2xl border border-gray-200 hover:border-brand-accent/40 transition-colors shadow-sm">
                    <div className="mr-4 mt-1">{item.icon}</div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h4>
                      <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-brand-accent/20 blur-3xl rounded-full"></div>
              <img 
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Restaurant Interior" 
                className="relative z-10 rounded-3xl shadow-2xl border-4 border-white/10 object-cover aspect-square"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 lg:py-16 bg-[#F8FAFC] border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Seamless Setup & Integration</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Get your restaurant up and running on Dine & Dusk in three simple steps.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gray-200 z-0"></div>
            
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up for a free trial and customize your basic business profile.' },
              { step: '02', title: 'Build Your Menu', desc: 'Easily import your existing menu or build a new one with our intuitive editor.' },
              { step: '03', title: 'Start Taking Orders', desc: 'Launch your POS, connect your KDS, and watch the orders flow in seamlessly.' }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                className="relative z-10 flex flex-col items-center text-center"
              >
                <div className="w-24 h-24 bg-white rounded-full shadow-md border-4 border-[#F8FAFC] flex items-center justify-center mb-6">
                  <span className="text-3xl font-black text-brand-accent">{item.step}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed max-w-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 lg:py-16 bg-[#F8FAFC] border-t border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Trusted By Hospitality Leaders</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              See what our partners are saying about the Dine & Dusk experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Jenkins',
                role: 'Owner, The Rustic Spoon',
                text: 'Since switching to Dine & Dusk, our table turnaround time has improved by 20%. The KDS is an absolute game-changer for our kitchen staff.'
              },
              {
                name: 'Michael Chang',
                role: 'Manager, Horizon Lounge',
                text: 'The analytics dashboard gives me insights I never knew I needed. Being able to track our most profitable items in real-time is incredible.'
              },
              {
                name: 'Elena Rodriguez',
                role: 'Operations Director, Cafe Vita',
                text: 'The interface is so intuitive that training new staff takes half the time it used to. It is beautifully designed and incredibly robust.'
              }
            ].map((testimonial, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white p-8 rounded-3xl relative border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <Quote className="w-12 h-12 text-brand-accent/20 absolute top-6 right-6" />
                <div className="flex text-brand-accent mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                </div>
                <p className="text-gray-600 leading-relaxed mb-6 italic">"{testimonial.text}"</p>
                <div>
                  <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Info */}
          <div>
            <img 
              src="/logo.png" 
              alt="Dine & Dusk" 
              className="h-16 w-auto object-contain mb-6"
              style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5)) brightness(1.2)' }}
            />
            <p className="text-gray-400 font-medium leading-relaxed mb-6">
              The ultimate operating system for modern dining, designed to streamline operations and scale your business effortlessly.
            </p>
            <div className="flex space-x-4 text-gray-400">
              <a href="#" className="hover:text-brand-accent transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="hover:text-brand-accent transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="hover:text-brand-accent transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="hover:text-brand-accent transition-colors"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6">Quick Links</h4>
            <ul className="space-y-4 text-sm font-medium text-gray-400">
              <li><button onClick={() => scrollToSection('features')} className="hover:text-brand-accent transition-colors">Features</button></li>
              <li><button onClick={() => scrollToSection('services')} className="hover:text-brand-accent transition-colors">Services</button></li>
              <li><button onClick={() => scrollToSection('about')} className="hover:text-brand-accent transition-colors">About Us</button></li>
              <li><Link to="/login" className="hover:text-brand-accent transition-colors">Log In</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-bold mb-6">Contact Us</h4>
            <ul className="space-y-4 text-sm font-medium text-gray-400">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 text-brand-accent mr-3 shrink-0" />
                <span>123 Culinary Ave, Suite 400<br/>New York, NY 10001</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 text-brand-accent mr-3 shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 text-brand-accent mr-3 shrink-0" />
                <span>hello@dinedusk.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-bold mb-6">Stay Updated</h4>
            <p className="text-gray-400 text-sm mb-4">Subscribe to our newsletter for the latest restaurant industry insights.</p>
            <div className="flex">
              <input type="email" placeholder="Enter your email" className="bg-white/10 border border-white/10 rounded-l-lg px-4 py-2 w-full focus:outline-none focus:border-brand-accent text-sm text-white placeholder-gray-500" />
              <button className="bg-brand-accent text-white px-4 py-2 rounded-r-lg font-bold text-sm hover:bg-brand-primary transition-colors">Subscribe</button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Dine & Dusk. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
