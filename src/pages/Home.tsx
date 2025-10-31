import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, CreditCard, TrendingUp, Users, Award } from "lucide-react";
import { Link } from "react-router-dom";
import Hero from "@/components/Hero";


const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-elegant transition-transform duration-300 group-hover:scale-110">
              <span className="text-white font-bold text-sm">WTB</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">Western Trust Bank</h1>
              <p className="text-xs text-muted-foreground">Your Trusted Banking Partner</p>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors font-medium">About</Link>
            <Link to="/services" className="text-muted-foreground hover:text-primary transition-colors font-medium">Services</Link>
            <Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors font-medium">FAQ</Link>
            <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors font-medium">Contact</Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Button asChild variant="outline" className="transition-all duration-300 hover:shadow-elegant">
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild className="transition-all duration-300 hover:shadow-elegant">
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-foreground animate-fade-in">
            Why Choose Western Trust Bank?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <Card className="text-center transition-all duration-300 hover:shadow-elegant hover:-translate-y-2 animate-fade-in border-primary/10">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-elegant">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl mb-2">Bank-Level Security</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Your data is protected with industry-leading encryption and security measures
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center transition-all duration-300 hover:shadow-elegant hover:-translate-y-2 animate-fade-in border-primary/10" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-elegant">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl mb-2">Smart Financial Tools</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Track spending, set budgets, and grow your savings with our intelligent features
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center transition-all duration-300 hover:shadow-elegant hover:-translate-y-2 animate-fade-in border-primary/10" style={{ animationDelay: "0.2s" }}>
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-elegant">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl mb-2">24/7 Support</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Our dedicated team is always here to help you with any banking needs
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-card">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-foreground">
            Our Banking Services
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="transition-all duration-300 hover:shadow-card hover:-translate-y-1 group">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-base sm:text-lg">Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm sm:text-base">Checking and savings accounts with competitive rates</p>
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:shadow-card hover:-translate-y-1 group">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-base sm:text-lg">Transfers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm sm:text-base">Quick and secure money transfers to any account</p>
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:shadow-card hover:-translate-y-1 group">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-base sm:text-lg">Loans</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm sm:text-base">Personal and business loans with flexible terms</p>
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:shadow-card hover:-translate-y-1 group">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-base sm:text-lg">Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm sm:text-base">Advanced fraud protection and account monitoring</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h3 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 animate-fade-in">Ready to Start Banking Smarter?</h3>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 opacity-95 animate-fade-in max-w-2xl mx-auto" style={{ animationDelay: "0.1s" }}>
            Join thousands of satisfied customers who trust Western Trust Bank with their financial future.
          </p>
          <Button asChild size="lg" className="bg-white text-primary hover:bg-neutral-50 text-base sm:text-lg px-8 sm:px-10 py-6 shadow-elegant transition-all duration-300 hover:scale-105 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <Link to="/auth">Open Your Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center sm:text-left">
            <div className="sm:col-span-2 lg:col-span-1">
              <Link to="/" className="flex items-center space-x-2 mb-4 group w-fit mx-auto sm:mx-0">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-primary rounded-full flex items-center justify-center shadow-elegant transition-transform duration-300 group-hover:scale-110">
                  <span className="text-white font-bold text-xs">WTB</span>
                </div>
                <span className="font-bold text-primary text-sm sm:text-base">Western Trust Bank</span>
              </Link>
              <p className="text-muted-foreground text-sm sm:text-base">
                Your trusted partner for modern, secure banking solutions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base text-foreground">Quick Links</h4>
              <ul className="space-y-2 text-muted-foreground text-sm sm:text-base">
                <li><Link to="/about" className="transition-colors hover:text-primary">About Us</Link></li>
                <li><Link to="/services" className="transition-colors hover:text-primary">Services</Link></li>
                <li><Link to="/faq" className="transition-colors hover:text-primary">FAQs</Link></li>
                <li><Link to="/contact" className="transition-colors hover:text-primary">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base text-foreground">Resources</h4>
              <ul className="space-y-2 text-muted-foreground text-sm sm:text-base">
                <li><Link to="/auth" className="transition-colors hover:text-primary">Online Banking</Link></li>
                <li><Link to="/services" className="transition-colors hover:text-primary">Security Tips</Link></li>
                <li><Link to="/faq" className="transition-colors hover:text-primary">Help Center</Link></li>
                <li><Link to="/contact" className="transition-colors hover:text-primary">Support</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base text-foreground">Get in Touch</h4>
              <div className="space-y-2 text-muted-foreground text-sm sm:text-base">
                <p><a href="tel:1-800-SECURE" className="transition-colors hover:text-primary">1-800-SECURE</a></p>
                <p><a href="mailto:support@westerntrust.com" className="transition-colors hover:text-primary">support@westerntrust.com</a></p>
                <p className="text-success font-medium">Available 24/7</p>
              </div>
            </div>
          </div>
          
          <div className="border-t mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-muted-foreground">
            <p className="text-sm sm:text-base">&copy; 2024 Western Trust Bank. All rights reserved. Member FDIC.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;