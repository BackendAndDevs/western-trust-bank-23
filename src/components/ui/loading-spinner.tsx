import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const LoadingSpinner = ({ size = "md", className }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex items-center justify-center">
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size], className)} />
    </div>
  );
};

export const LoadingOverlay = ({ message = "Loading..." }: { message?: string }) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4 p-8 rounded-2xl bg-card shadow-elegant">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground font-medium">{message}</p>
      </div>
    </div>
  );
};
