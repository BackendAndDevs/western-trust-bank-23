
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Home, TrendingUp, Briefcase, PiggyBank, Car } from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: CreditCard,
      title: "Personal Banking",
      description: "Checking, savings, and credit cards designed for your lifestyle with no hidden fees.",
      features: ["No monthly fees", "24/7 online access", "Mobile check deposit"]
    },
    {
      icon: Home,
      title: "Home Loans",
      description: "Competitive rates and personalized service to help you find your dream home.",
      features: ["Low down payments", "Fast approval", "Expert guidance"]
    },
    {
      icon: TrendingUp,
      title: "Investment Services",
      description: "Grow your wealth with our comprehensive investment and retirement planning solutions.",
      features: ["Portfolio management", "Retirement planning", "Financial advisors"]
    },
    {
      icon: Briefcase,
      title: "Business Banking",
      description: "Complete banking solutions to help your business thrive and grow.",
      features: ["Business loans", "Merchant services", "Payroll solutions"]
    },
    {
      icon: PiggyBank,
      title: "Savings & CDs",
      description: "Competitive rates on savings accounts and certificates of deposit.",
      features: ["High-yield savings", "Flexible terms", "FDIC insured"]
    },
    {
      icon: Car,
      title: "Auto Loans",
      description: "Get behind the wheel with our competitive auto loan rates and quick approval.",
      features: ["Low rates", "New & used", "Online application"]
    }
  ];

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Banking Services Tailored for You
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From personal banking to business solutions, we offer comprehensive financial services 
            to meet all your needs with the security and trust you deserve.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <service.icon className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-6">{service.description}</p>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="text-sm text-gray-500 flex items-center justify-center">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                  Learn More
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
