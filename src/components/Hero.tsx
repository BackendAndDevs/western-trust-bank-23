import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Award, Users, TrendingUp, Lock, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-banking-green-dark text-white py-20 lg:py-32">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-banking-green/20 via-transparent to-banking-green/10 animate-pulse-glow"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-banking-green/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-banking-green/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-banking-green/20 border border-banking-green/30 backdrop-blur-sm">
              <Zap className="w-4 h-4 text-banking-green-light" />
              <span className="text-sm font-medium text-banking-green-light">Trusted by 2M+ customers</span>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight bg-gradient-to-r from-white via-neutral-100 to-neutral-300 bg-clip-text text-transparent">
                Your Financial Future Starts Here
              </h1>
              <p className="text-lg lg:text-xl text-neutral-300 leading-relaxed max-w-xl">
                Experience banking built on trust, security, and over 150 years of financial expertise with cutting-edge technology.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                asChild
                size="lg" 
                className="bg-gradient-primary text-white hover:shadow-glow font-semibold text-lg px-8 py-6 h-auto group transition-all duration-300 hover:scale-105"
              >
                <Link to="/auth">
                  Open Account Today
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button 
                asChild
                size="lg" 
                variant="outline" 
                className="border-2 border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white hover:text-neutral-900 font-semibold text-lg px-8 py-6 h-auto transition-all duration-300 hover:scale-105"
              >
                <Link to="/about">Learn More</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              {[
                { icon: Shield, label: "FDIC", value: "Insured", color: "text-banking-green-light" },
                { icon: Award, label: "150+", value: "Years", color: "text-banking-green-light" },
                { icon: Users, label: "2M+", value: "Customers", color: "text-banking-green-light" }
              ].map((stat, idx) => (
                <div 
                  key={idx} 
                  className="text-center group cursor-default"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm mb-3 group-hover:bg-white/20 transition-all duration-300 group-hover:scale-110">
                    <stat.icon className={`h-7 w-7 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-bold">{stat.label}</div>
                  <div className="text-sm text-neutral-400">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-4 pt-4 opacity-70">
              {[
                { icon: Lock, text: "256-bit SSL Encryption" },
                { icon: Shield, text: "FDIC Protected" },
                { icon: TrendingUp, text: "Real-time Analytics" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-sm text-neutral-400">
                  <item.icon className="w-4 h-4" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image */}
          <div className="hidden lg:block relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="absolute -inset-4 bg-gradient-primary opacity-20 blur-2xl rounded-3xl"></div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80"
                alt="Professional banking consultation"
                className="rounded-2xl shadow-2xl border border-white/10 hover:scale-[1.02] transition-transform duration-500"
              />
              
              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-elegant animate-slide-up">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-neutral-600 font-medium">Account Growth</div>
                    <div className="text-lg font-bold text-banking-green">+24.5%</div>
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
