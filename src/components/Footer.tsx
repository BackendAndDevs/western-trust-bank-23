import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "./Logo";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-neutral-900 text-neutral-300">
      {/* Main Footer - Compact */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
          {/* Brand */}
          <div className="shrink-0">
            <Logo size="sm" />
          </div>

          {/* Quick Links - Horizontal on desktop */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {['About', 'Services', 'FAQ', 'Contact', 'Careers', 'Security'].map((item) => (
              <Link
                key={item}
                to={`/${item.toLowerCase()}`}
                className="text-neutral-400 hover:text-banking-green transition-colors duration-200"
              >
                {item}
              </Link>
            ))}
          </nav>

          {/* Social Icons */}
          <div className="flex items-center space-x-2">
            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
              <a
                key={idx}
                href="#"
                className="p-2 rounded-lg bg-neutral-800/60 hover:bg-banking-green/20 hover:text-banking-green transition-all duration-200"
                aria-label={`Social link ${idx + 1}`}
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar - Super Compact */}
      <div className="border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
            <p>© {currentYear} Western Trust Bank. Member FDIC. Equal Housing Lender.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#" className="hover:text-banking-green transition-colors">Privacy</a>
              <a href="#" className="hover:text-banking-green transition-colors">Terms</a>
              <a href="#" className="hover:text-banking-green transition-colors">Accessibility</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
