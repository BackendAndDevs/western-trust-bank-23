import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useBanking } from "@/contexts/BankingContext";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useBanking();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = login(username, password);
      
      if (success) {
        toast({
          title: "Login Successful",
          description: "Welcome back to Western Trust Bank!",
        });
        
        // Check if admin user
        if (username === "zero4321") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid username or password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-banking-green-light to-accent flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center">
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">Western Trust Bank</h1>
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center pb-4 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl">Welcome Back</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Sign in to your Western Trust Bank account to access your dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username or Email</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username or email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-4 sm:mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/create-account" className="text-primary hover:underline font-medium">
                  Create Account
                </Link>
              </p>
            </div>

          </CardContent>
        </Card>

        <div className="mt-6 sm:mt-8 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;