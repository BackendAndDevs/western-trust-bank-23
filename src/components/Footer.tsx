
import { Shield, Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer id="contact" className="relative bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-foreground overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-banking-green/5 via-transparent to-banking-green/5 pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Company Info */}
          <div className="space-y-6 lg:col-span-1">
            <div className="flex items-center space-x-3 group">
              <div className="p-2 rounded-lg bg-gradient-primary shadow-green transition-all duration-300 group-hover:shadow-glow">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
                Western Trust Bank
              </span>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Your trusted financial partner for over 150 years. Banking made simple, secure, and personal.
            </p>
            <div className="flex space-x-3">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="p-2.5 rounded-lg bg-neutral-800/50 border border-neutral-700/50 hover:border-banking-green/50 hover:bg-banking-green/10 transition-all duration-300 group"
                >
                  <Icon className="h-4 w-4 text-neutral-400 group-hover:text-banking-green transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white relative inline-block after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-gradient-primary pb-2">
              Services
            </h3>
            <ul className="space-y-2.5">
              {['Personal Banking', 'Business Banking', 'Loans & Mortgages', 'Investment Services', 'Credit Cards', 'Online Banking'].map((item, idx) => (
                <li key={idx}>
                  <a href="#" className="text-sm text-neutral-400 hover:text-banking-green hover:translate-x-1 inline-block transition-all duration-200">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white relative inline-block after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-gradient-primary pb-2">
              Support
            </h3>
            <ul className="space-y-2.5">
              {['Customer Service', 'Find a Branch', 'ATM Locator', 'Help Center', 'Security Center', 'Contact Us'].map((item, idx) => (
                <li key={idx}>
                  <a href="#" className="text-sm text-neutral-400 hover:text-banking-green hover:translate-x-1 inline-block transition-all duration-200">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white relative inline-block after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-gradient-primary pb-2">
              Contact
            </h3>
            <div className="space-y-4">
              <a href="tel:1-800-937-8376" className="flex items-center space-x-3 text-sm text-neutral-400 hover:text-banking-green transition-colors group">
                <div className="p-2 rounded-lg bg-neutral-800/50 group-hover:bg-banking-green/10 transition-colors">
                  <Phone className="h-4 w-4" />
                </div>
                <span className="text-xs">1-800-WESTERN</span>
              </a>
              <a href="mailto:support@westerntrustbank.com" className="flex items-center space-x-3 text-sm text-neutral-400 hover:text-banking-green transition-colors group">
                <div className="p-2 rounded-lg bg-neutral-800/50 group-hover:bg-banking-green/10 transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                <span className="text-xs">support@westerntrustbank.com</span>
              </a>
              <div className="flex items-start space-x-3 text-sm text-neutral-400 group">
                <div className="p-2 rounded-lg bg-neutral-800/50 group-hover:bg-banking-green/10 transition-colors">
                  <MapPin className="h-4 w-4 mt-0.5" />
                </div>
                <div className="text-xs leading-relaxed">
                  <div>123 Financial District</div>
                  <div>New York, NY 10005</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-neutral-700/50 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 gap-4">
            <div className="text-xs text-neutral-500 text-center md:text-left">
              © 2024 Western Trust Bank. All rights reserved. Member FDIC. Equal Housing Lender.
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-xs text-neutral-500">
              <a href="#" className="hover:text-banking-green transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-banking-green transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-banking-green transition-colors">Accessibility</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
