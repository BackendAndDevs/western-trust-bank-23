import { ReactNode } from "react";
import AppHeader from "./AppHeader";

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

const PageLayout = ({ children, className = "" }: PageLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className={className}>
        {children}
      </main>
    </div>
  );
};

export default PageLayout;
