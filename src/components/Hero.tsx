import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Award, Users, TrendingUp, Lock, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-banking-green-dark text-white min-h-[90vh] sm:min-h-[85vh] lg:min-h-screen flex items-center">
      {/* Optimized animated overlays with will-change for GPU acceleration */}
      <div className="absolute inset-0 bg-gradient-to-br from-banking-green/20 via-transparent to-banking-green/10 will-change-transform"></div>
      
      {/* Decorative blurs - reduced on mobile for performance */}
      <div className="absolute top-10 sm:top-20 right-10 sm:right-20 w-48 sm:w-72 h-48 sm:h-72 bg-banking-green/10 rounded-full blur-3xl animate-pulse will-change-opacity"></div>
      <div className="absolute bottom-10 sm:bottom-20 left-10 sm:left-20 w-64 sm:w-96 h-64 sm:h-96 bg-banking-green/5 rounded-full blur-3xl animate-pulse will-change-opacity" style={{ animationDelay: '1s' }}></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-6 sm:space-y-8 animate-fade-in text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-banking-green/20 border border-banking-green/30 backdrop-blur-sm">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-banking-green-light" />
              <span className="text-xs sm:text-sm font-medium text-banking-green-light">Trusted by 2M+ customers</span>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] bg-gradient-to-r from-white via-neutral-100 to-neutral-300 bg-clip-text text-transparent">
                Your Financial Future Starts Here
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-neutral-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Experience banking built on trust, security, and over 150 years of financial expertise.
              </p>
            </div>

            {/* CTA Buttons - Stack on mobile */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <Button 
                asChild
                size="lg" 
                className="bg-gradient-primary text-white hover:shadow-glow font-semibold text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 h-auto group transition-all duration-300 active:scale-[0.98] touch-manipulation"
              >
                <Link to="/auth">
                  Open Account Today
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button 
                asChild
                size="lg" 
                variant="outline" 
                className="border-2 border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white hover:text-neutral-900 font-semibold text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 h-auto transition-all duration-300 active:scale-[0.98] touch-manipulation"
              >
                <Link to="/about">Learn More</Link>
              </Button>
            </div>

            {/* Stats - Responsive grid */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-6 sm:pt-8">
              {[
                { icon: Shield, label: "FDIC", value: "Insured" },
                { icon: Award, label: "150+", value: "Years" },
                { icon: Users, label: "2M+", value: "Customers" }
              ].map((stat, idx) => (
                <div key={idx} className="text-center group cursor-default">
                  <div className="inline-flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-sm mb-2 sm:mb-3 group-hover:bg-white/20 transition-all duration-300">
                    <stat.icon className="h-5 w-5 sm:h-7 sm:w-7 text-banking-green-light" />
                  </div>
                  <div className="text-lg sm:text-2xl font-bold">{stat.label}</div>
                  <div className="text-xs sm:text-sm text-neutral-400">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Trust indicators - Hidden on mobile, visible on tablet+ */}
            <div className="hidden sm:flex flex-wrap gap-4 pt-4 opacity-70 justify-center lg:justify-start">
              {[
                { icon: Lock, text: "256-bit SSL" },
                { icon: Shield, text: "FDIC Protected" },
                { icon: TrendingUp, text: "Real-time Analytics" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-xs sm:text-sm text-neutral-400">
                  <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image - Hidden on mobile, tablet shows smaller version */}
          <div className="hidden md:block relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="absolute -inset-4 bg-gradient-primary opacity-20 blur-2xl rounded-3xl"></div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=75"
                alt="Professional banking consultation"
                className="rounded-2xl shadow-2xl border border-white/10 w-full h-auto"
                loading="eager"
                decoding="async"
              />
              
              {/* Floating card - Smaller on tablet */}
              <div className="absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-elegant animate-slide-up">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-[10px] sm:text-xs text-neutral-600 font-medium">Account Growth</div>
                    <div className="text-base sm:text-lg font-bold text-banking-green">+24.5%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
