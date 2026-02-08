import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, CreditCard, TrendingUp, Users, Award, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import AppHeader from "@/components/AppHeader";

// Import futuristic icons
import depositIcon from "@/assets/icons/deposit-icon.png";
import transferIcon from "@/assets/icons/transfer-icon.png";
import cardIcon from "@/assets/icons/card-icon.png";
import securityIcon from "@/assets/icons/security-icon.png";
import withdrawIcon from "@/assets/icons/withdraw-icon.png";
import analyticsIcon from "@/assets/icons/analytics-icon.png";

const Home = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <AppHeader />

      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-24 bg-gradient-subtle relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-banking-green/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-10 sm:mb-14 animate-fade-in">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
              Why Choose Western Trust Bank?
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the perfect blend of traditional values and modern technology
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[
              {
                icon: Shield,
                title: "Bank-Level Security",
                description: "256-bit encryption and real-time fraud monitoring protect your data"
              },
              {
                icon: TrendingUp,
                title: "Smart Financial Tools",
                description: "AI-powered insights help you track spending and grow savings"
              },
              {
                icon: Users,
                title: "24/7 Expert Support",
                description: "Our dedicated team is always here to help you succeed"
              }
            ].map((feature, idx) => (
              <Card 
                key={idx}
                className="group text-center card-hover border-primary/10 bg-card/50 backdrop-blur-sm overflow-hidden relative" 
              >
                <CardHeader className="p-4 sm:p-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-primary rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-elegant group-hover:shadow-glow transition-all duration-500 group-hover:scale-105">
                    <feature.icon className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl mb-2 sm:mb-3">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section with Futuristic Icons */}
      <section className="py-12 sm:py-16 lg:py-24 bg-card relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
              Our Banking Services
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive financial solutions designed for your success
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[
              { icon: depositIcon, title: "Deposits", description: "Secure fund deposits with instant confirmation", link: "/deposit" },
              { icon: withdrawIcon, title: "Withdrawals", description: "Quick and easy cash withdrawals", link: "/withdraw" },
              { icon: transferIcon, title: "Transfers", description: "Instant secure money transfers", link: "/transfer" },
              { icon: cardIcon, title: "Cards", description: "Premium debit & credit cards", link: "/cards" },
              { icon: securityIcon, title: "Security", description: "Advanced fraud protection", link: "/services" },
              { icon: analyticsIcon, title: "Analytics", description: "AI-powered financial insights", link: "/dashboard" }
            ].map((service, idx) => (
              <Link to={service.link} key={idx}>
                <Card className="group card-hover border-primary/10 overflow-hidden h-full bg-gradient-to-br from-neutral-900 to-neutral-800">
                  <CardHeader className="p-4 sm:p-5 lg:p-6 text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-3 sm:mb-4 rounded-2xl overflow-hidden group-hover:scale-110 transition-transform duration-300 shadow-glow">
                      <img 
                        src={service.icon} 
                        alt={service.title} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <CardTitle className="text-sm sm:text-base lg:text-lg text-white mb-1 sm:mb-2">
                      {service.title}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 sm:py-20 lg:py-28 bg-gradient-to-br from-neutral-900 via-banking-green-dark to-neutral-900 text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-banking-green/20 via-transparent to-banking-green/10"></div>
        <div className="absolute top-1/4 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-banking-green/20 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="space-y-5 sm:space-y-6">
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold leading-tight">
              Ready to Start Banking Smarter?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
              Join thousands who trust Western Trust Bank with their financial future.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2">
              <Button asChild size="lg" className="bg-white text-banking-green hover:bg-neutral-100 font-semibold shadow-elegant transition-all duration-300 active:scale-[0.98] touch-manipulation group">
                <Link to="/auth" className="flex items-center justify-center">
                  Open Your Account
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold">
                <Link to="/contact">Contact Sales</Link>
              </Button>
            </div>
            
            {/* Trust badges - Responsive */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 pt-6 opacity-80">
              {[
                { icon: Shield, text: "FDIC Insured" },
                { icon: Lock, text: "SSL Secured" },
                { icon: Award, text: "Award Winning" }
              ].map((badge, idx) => (
                <div key={idx} className="flex items-center space-x-1.5 sm:space-x-2 text-white/80">
                  <badge.icon className="w-4 h-4" />
                  <span className="text-xs sm:text-sm font-medium">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;