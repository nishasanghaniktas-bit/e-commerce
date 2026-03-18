import { Link } from 'react-router-dom';
import { Smartphone, Mail, Phone, MapPin, Twitter, Instagram, Linkedin, Facebook } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-16 px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
        {/* Brand */}
        <div className="space-y-6">
          <Link to="/" className="flex items-center space-x-2 text-white">
            <Smartphone className="w-8 h-8 text-indigo-500" />
            <span className="text-2xl font-bold">MobileSale</span>
          </Link>
          <p className="text-sm leading-relaxed max-w-xs">
            Discover the latest smartphones and premium accessories at unbeatable prices. Experience luxury technology with every swipe.
          </p>
          <div className="flex space-x-4">
            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all duration-300">
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-6">Quick Links</h4>
          <ul className="space-y-4 text-sm">
            <li><Link to="/products" className="hover:text-indigo-400 transition">All Products</Link></li>
            <li><Link to="/products?category=Smartphones" className="hover:text-indigo-400 transition">Smartphones</Link></li>
            <li><Link to="/products?category=Accessories" className="hover:text-indigo-400 transition">Accessories</Link></li>
            <li><Link to="/user/orders" className="hover:text-indigo-400 transition">Track Order</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-white font-semibold mb-6">Support</h4>
          <ul className="space-y-4 text-sm">
            <li><a href="#" className="hover:text-indigo-400 transition">Help Center</a></li>
            <li><a href="#" className="hover:text-indigo-400 transition">Shipping Policy</a></li>
            <li><a href="#" className="hover:text-indigo-400 transition">Returns & Refunds</a></li>
            <li><a href="#" className="hover:text-indigo-400 transition">Privacy Policy</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-6">Contact Us</h4>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-indigo-500 shrink-0" />
              <span>123 Tech Avenue, Silicon Valley, CA 94025, USA</span>
            </li>
            <li className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-indigo-500 shrink-0" />
              <span>+1 (555) 123-4567</span>
            </li>
            <li className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-indigo-500 shrink-0" />
              <span>support@mobilesale.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto mt-16 pt-8 border-t border-slate-800 flex flex-col md:row items-center justify-between text-xs tracking-wider uppercase font-medium relative z-10">
        <p>&copy; 2026 MobileSale. All rights reserved.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <span>Terms of Service</span>
          <span>Cookies</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
