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
      <section className="py-20 bg-gradient-to-br from-banking-green-light to-accent">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-6 text-foreground">
            Your Trusted Banking Partner
          </h2>
          <p className="text-xl mb-8 text-muted-foreground max-w-2xl mx-auto">
            Experience secure, modern banking with our comprehensive digital platform. 
            Manage your finances with confidence and ease.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/create-account">Get Started Today</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link to="/login">Access Your Account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">
            Why Choose Western Trust Bank?
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Bank-Level Security</CardTitle>
                <CardDescription>
                  Your data is protected with industry-leading encryption and security measures
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Smart Financial Tools</CardTitle>
                <CardDescription>
                  Track spending, set budgets, and grow your savings with our intelligent features
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>24/7 Support</CardTitle>
                <CardDescription>
                  Our dedicated team is always here to help you with any banking needs
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">
            Our Banking Services
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Accounts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Checking and savings accounts with competitive rates</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Transfers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Quick and secure money transfers to any account</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Loans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Personal and business loans with flexible terms</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Advanced fraud protection and account monitoring</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-6">Ready to Start Banking Smarter?</h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of satisfied customers who trust Western Trust Bank with their financial future.
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8">
            <Link to="/create-account">Open Your Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img src={bankBadge} alt="Western Trust Bank Badge" className="w-8 h-8" />
                <span className="font-bold text-primary">Western Trust Bank</span>
              </div>
              <p className="text-muted-foreground">
                Your trusted partner for modern, secure banking solutions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Personal Banking</li>
                <li>Business Banking</li>
                <li>Loans & Credit</li>
                <li>Investment Services</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Contact Us</li>
                <li>Help Center</li>
                <li>Security Center</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-muted-foreground">
                <p>1-800-SECURE</p>
                <p>support@westerntrust.com</p>
                <p>Available 24/7</p>
              </div>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Western Trust Bank. All rights reserved. Member FDIC.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;