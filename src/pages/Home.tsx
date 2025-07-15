import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, CreditCard, TrendingUp, Users, Award } from "lucide-react";
import { Link } from "react-router-dom";
import bankBadge from "@/assets/bank-badge.png";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={bankBadge} alt="Western Trust Bank Badge" className="w-10 h-10" />
            <div>
              <h1 className="text-2xl font-bold text-primary">Western Trust Bank</h1>
              <p className="text-xs text-muted-foreground">Your Trusted Banking Partner</p>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <Button asChild variant="outline">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/create-account">Create Account</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-banking-green-light to-accent">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-foreground">
            Your Trusted Banking Partner
          </h2>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-muted-foreground max-w-2xl mx-auto">
            Experience secure, modern banking with our comprehensive digital platform. 
            Manage your finances with confidence and ease.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Button asChild size="lg" className="text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto">
              <Link to="/create-account">Get Started Today</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto">
              <Link to="/login">Access Your Account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-foreground">
            Why Choose Western Trust Bank?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Bank-Level Security</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Your data is protected with industry-leading encryption and security measures
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Smart Financial Tools</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Track spending, set budgets, and grow your savings with our intelligent features
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">24/7 Support</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Our dedicated team is always here to help you with any banking needs
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-foreground">
            Our Banking Services
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Accounts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm sm:text-base">Checking and savings accounts with competitive rates</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Transfers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm sm:text-base">Quick and secure money transfers to any account</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Award className="w-5 h-5 text-primary" />
                  Loans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm sm:text-base">Personal and business loans with flexible terms</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Lock className="w-5 h-5 text-primary" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm sm:text-base">Advanced fraud protection and account monitoring</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Ready to Start Banking Smarter?</h3>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 opacity-90">
            Join thousands of satisfied customers who trust Western Trust Bank with their financial future.
          </p>
          <Button asChild size="lg" variant="secondary" className="text-base sm:text-lg px-6 sm:px-8">
            <Link to="/create-account">Open Your Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <img src={bankBadge} alt="Western Trust Bank Badge" className="w-6 h-6 sm:w-8 sm:h-8" />
                <span className="font-bold text-primary text-sm sm:text-base">Western Trust Bank</span>
              </div>
              <p className="text-muted-foreground text-sm sm:text-base">
                Your trusted partner for modern, secure banking solutions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Services</h4>
              <ul className="space-y-2 text-muted-foreground text-sm sm:text-base">
                <li>Personal Banking</li>
                <li>Business Banking</li>
                <li>Loans & Credit</li>
                <li>Investment Services</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Support</h4>
              <ul className="space-y-2 text-muted-foreground text-sm sm:text-base">
                <li>Contact Us</li>
                <li>Help Center</li>
                <li>Security Center</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Contact</h4>
              <div className="space-y-2 text-muted-foreground text-sm sm:text-base">
                <p>1-800-SECURE</p>
                <p>support@westerntrust.com</p>
                <p>Available 24/7</p>
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