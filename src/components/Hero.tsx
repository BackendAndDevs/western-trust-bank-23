
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Award, Users } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-20 lg:py-32">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Your Financial Future Starts Here
              </h1>
              <p className="text-xl lg:text-2xl text-blue-100">
                Experience banking built on trust, security, and over 150 years of financial expertise.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-white text-blue-900 hover:bg-gray-100 font-semibold text-lg px-8 py-4 h-auto"
              >
                Open Account Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-blue-900 font-semibold text-lg px-8 py-4 h-auto"
              >
                Learn More
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <Shield className="h-8 w-8 mx-auto mb-2 text-blue-200" />
                <div className="text-2xl font-bold">FDIC</div>
                <div className="text-sm text-blue-200">Insured</div>
              </div>
              <div className="text-center">
                <Award className="h-8 w-8 mx-auto mb-2 text-blue-200" />
                <div className="text-2xl font-bold">150+</div>
                <div className="text-sm text-blue-200">Years</div>
              </div>
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-200" />
                <div className="text-2xl font-bold">2M+</div>
                <div className="text-sm text-blue-200">Customers</div>
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <img
              src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80"
              alt="Professional banking consultation"
              className="rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
