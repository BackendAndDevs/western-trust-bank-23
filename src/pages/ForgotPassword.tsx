import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/auth`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        throw error;
      }

      setIsSubmitted(true);
    } catch (error: any) {
      setError(error.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-banking-green-light to-accent flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle>Check Your Email</CardTitle>
            <CardDescription>
              We've sent a password reset link to your email address.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                If an account with email <strong>{email}</strong> exists, you will receive a password reset link shortly.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Check your spam folder if you don't see the email</p>
              <p>• The link will expire in 1 hour</p>
              <p>• You can request a new link if needed</p>
            </div>

            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail("");
                }}
              >
                Send Another
              </Button>
              <Button asChild className="flex-1">
                <Link to="/auth">Back to Login</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-banking-green-light to-accent flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center space-x-2 text-muted-foreground mb-4">
            <Link to="/auth" className="hover:text-primary">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="text-sm">Back to Login</span>
          </div>
          <CardTitle>Reset Your Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link to="/auth" className="text-primary hover:underline">
                Sign in instead
              </Link>
            </p>
          </div>

          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <h3 className="text-sm font-medium mb-2">Security Notice</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Password reset links expire after 1 hour</li>
              <li>• Only click links from trusted sources</li>
              <li>• Contact support if you need additional help</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;