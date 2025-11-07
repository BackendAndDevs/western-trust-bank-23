import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, CreditCard, TrendingUp, Users, Award, ArrowRight } from "lucide-react";
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
      <section className="py-16 sm:py-20 lg:py-28 bg-gradient-subtle relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-banking-green/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-banking-green/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12 sm:mb-16 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Why Choose Western Trust Bank?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the perfect blend of traditional banking values and modern technology
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            {[
              {
                icon: Shield,
                title: "Bank-Level Security",
                description: "Your data is protected with industry-leading 256-bit encryption and real-time fraud monitoring",
                delay: "0s"
              },
              {
                icon: TrendingUp,
                title: "Smart Financial Tools",
                description: "Track spending, set budgets, and grow your savings with AI-powered insights and recommendations",
                delay: "0.1s"
              },
              {
                icon: Users,
                title: "24/7 Expert Support",
                description: "Our dedicated team of financial advisors is always here to help you make informed decisions",
                delay: "0.2s"
              }
            ].map((feature, idx) => (
              <Card 
                key={idx}
                className="group text-center card-hover border-primary/10 bg-card/50 backdrop-blur-sm animate-fade-in overflow-hidden relative" 
                style={{ animationDelay: feature.delay }}
              >
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
                <CardHeader className="relative">
                  <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-elegant group-hover:shadow-glow transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                    <feature.icon className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-xl sm:text-2xl mb-4 group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 sm:py-20 lg:py-28 bg-card relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Our Banking Services
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive financial solutions designed for your success
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { icon: CreditCard, title: "Accounts", description: "Checking and savings accounts with competitive interest rates", color: "bg-blue-500/10 text-blue-600" },
              { icon: TrendingUp, title: "Transfers", description: "Instant and secure money transfers to any account worldwide", color: "bg-green-500/10 text-green-600" },
              { icon: Award, title: "Loans", description: "Personal and business loans with flexible terms and low rates", color: "bg-purple-500/10 text-purple-600" },
              { icon: Lock, title: "Security", description: "Advanced fraud protection with real-time account monitoring", color: "bg-red-500/10 text-red-600" }
            ].map((service, idx) => (
              <Card 
                key={idx}
                className="group card-hover border-primary/10 overflow-hidden relative animate-fade-in" 
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative">
                  <div className={`w-14 h-14 ${service.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <service.icon className="w-7 h-7" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl mb-2 group-hover:text-primary transition-colors">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 sm:py-28 lg:py-36 bg-gradient-to-br from-neutral-900 via-banking-green-dark to-neutral-900 text-primary-foreground overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-banking-green/20 via-transparent to-banking-green/10"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-banking-green/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-banking-green/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight animate-fade-in">
              Ready to Start Banking Smarter?
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-white/90 leading-relaxed animate-fade-in max-w-3xl mx-auto" style={{ animationDelay: "0.1s" }}>
              Join thousands of satisfied customers who trust Western Trust Bank with their financial future. Open your account in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <Button asChild size="xl" className="bg-white text-banking-green hover:bg-neutral-100 font-semibold shadow-elegant transition-all duration-300 hover:scale-105 hover:shadow-glow group">
                <Link to="/auth" className="flex items-center">
                  Open Your Account
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="glass" className="font-semibold">
                <Link to="/contact">Contact Sales</Link>
              </Button>
            </div>
            
            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-8 pt-8 opacity-80 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              {[
                { icon: Shield, text: "FDIC Insured" },
                { icon: Lock, text: "SSL Secured" },
                { icon: Award, text: "Award Winning" },
                { icon: Users, text: "2M+ Customers" }
              ].map((badge, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-white/80">
                  <badge.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>
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