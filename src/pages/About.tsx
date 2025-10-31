import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Award, Users, TrendingUp, Target, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
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
          
          <div className="flex space-x-4">
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
      <section className="py-16 bg-gradient-to-br from-banking-green-light to-accent">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 text-foreground">About Western Trust Bank</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Since 1875, we've been dedicated to helping individuals and businesses achieve their financial goals with trust, integrity, and innovation.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-elegant">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-primary mb-2">150+</div>
              <div className="text-muted-foreground">Years of Excellence</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-elegant">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-primary mb-2">2M+</div>
              <div className="text-muted-foreground">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-elegant">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-primary mb-2">$50B+</div>
              <div className="text-muted-foreground">Assets Managed</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-elegant">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-primary mb-2">100%</div>
              <div className="text-muted-foreground">FDIC Insured</div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center text-foreground">Our Story</h2>
            <div className="space-y-4 text-muted-foreground text-lg">
              <p>
                Founded in 1875, Western Trust Bank has been a cornerstone of financial stability and innovation for over a century. 
                What started as a small community bank has grown into a trusted financial institution serving millions of customers nationwide.
              </p>
              <p>
                Throughout our history, we've remained committed to our founding principles: integrity, security, and putting our customers first. 
                We've weathered economic storms, adapted to technological changes, and always emerged stronger, always focused on serving you better.
              </p>
              <p>
                Today, we combine traditional banking values with cutting-edge technology to provide you with secure, convenient, 
                and personalized financial services. From mobile banking to wealth management, we're here to help you achieve your financial dreams.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center text-foreground">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center transition-all duration-300 hover:shadow-elegant hover:-translate-y-2">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-elegant">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Security & Trust</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your financial security is our top priority. We use industry-leading encryption and security measures to protect your data.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center transition-all duration-300 hover:shadow-elegant hover:-translate-y-2">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-elegant">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Customer Focus</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Every decision we make is centered around providing you with the best banking experience and helping you achieve your goals.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center transition-all duration-300 hover:shadow-elegant hover:-translate-y-2">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-elegant">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Community Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We believe in giving back to the communities we serve through charitable initiatives and financial education programs.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-6">Join Our Growing Family</h3>
          <p className="text-xl mb-8 opacity-95 max-w-2xl mx-auto">
            Experience the difference that 150 years of banking excellence can make in your financial journey.
          </p>
          <Button asChild size="lg" className="bg-white text-primary hover:bg-neutral-50 text-lg px-10 py-6 shadow-elegant transition-all duration-300 hover:scale-105">
            <Link to="/auth">Open Your Account Today</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default About;
