import { Button } from "@/components/ui/button";
import { Menu, X, Phone } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-background/95 backdrop-blur-md shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 sm:py-4">
          {/* Logo */}
          <Link to="/" className="shrink-0">
            <Logo size="sm" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <Link to="/services" className="text-muted-foreground hover:text-primary font-medium transition-colors text-sm xl:text-base">
              Services
            </Link>
            <Link to="/about" className="text-muted-foreground hover:text-primary font-medium transition-colors text-sm xl:text-base">
              About
            </Link>
            <Link to="/contact" className="text-muted-foreground hover:text-primary font-medium transition-colors text-sm xl:text-base">
              Contact
            </Link>
            <div className="hidden xl:flex items-center space-x-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span className="text-sm font-medium">1-800-WESTERN</span>
            </div>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
            <Link to="/auth">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/5 text-sm px-3 lg:px-4">
                Login
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-gradient-primary hover:opacity-90 text-primary-foreground text-sm px-3 lg:px-4">
                Open Account
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col space-y-3">
              <Link 
                to="/services" 
                className="text-foreground hover:text-primary font-medium py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                to="/about" 
                className="text-foreground hover:text-primary font-medium py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="text-foreground hover:text-primary font-medium py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="flex items-center space-x-2 text-muted-foreground py-2">
                <Phone className="h-4 w-4" />
                <span className="text-sm font-medium">1-800-WESTERN</span>
              </div>
              <div className="flex flex-col space-y-2 pt-3">
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/5">
                    Login
                  </Button>
                </Link>
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground">
                    Open Account
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
