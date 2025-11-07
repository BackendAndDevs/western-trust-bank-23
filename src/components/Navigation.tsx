import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { 
  Menu,
  Home,
  CreditCard,
  Plus,
  Minus,
  ArrowLeftRight,
  FileText,
  Settings,
  Shield,
  LogOut,
  User,
  Bell,
  Calendar,
  Download
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/useNotifications";

const Navigation = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
    setIsOpen(false);
  };

  const isAdmin = user?.user_metadata?.role === 'admin';

  const menuItems = [
    { 
      label: "Dashboard", 
      path: "/dashboard", 
      icon: Home,
      description: "Account overview"
    },
    { 
      label: "Deposit", 
      path: "/deposit", 
      icon: Plus,
      description: "Add funds"
    },
    { 
      label: "Withdraw", 
      path: "/withdraw", 
      icon: Minus,
      description: "Take money out"
    },
    { 
      label: "Transfer", 
      path: "/transfer", 
      icon: ArrowLeftRight,
      description: "Send money"
    },
    { 
      label: "Recurring", 
      path: "/recurring-transfers", 
      icon: Calendar,
      description: "Auto transfers"
    },
    { 
      label: "Statements", 
      path: "/statements", 
      icon: Download,
      description: "Download statements"
    },
    { 
      label: "Bills", 
      path: "/bills", 
      icon: FileText,
      description: "Pay bills"
    },
    { 
      label: "Cards", 
      path: "/cards", 
      icon: CreditCard,
      description: "Manage cards"
    },
    { 
      label: "Notifications", 
      path: "/notifications", 
      icon: Bell,
      description: "View alerts",
      badge: unreadCount
    },
    { 
      label: "Profile", 
      path: "/profile", 
      icon: User,
      description: "Account settings"
    }
  ];

  if (isAdmin) {
    menuItems.push({
      label: "Admin Panel",
      path: "/admin", 
      icon: Shield,
      description: "Administrative tools"
    });
  }

  const NavContent = ({ mobile = false }) => (
    <div className={`${mobile ? 'flex flex-col space-y-1' : 'hidden md:flex items-center space-x-1'}`}>
      {menuItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => mobile && setIsOpen(false)}
            className={`${
              mobile 
                ? 'flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 relative group'
                : 'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative group'
            } ${
              isActive
                ? mobile
                  ? 'bg-gradient-primary text-white shadow-elegant'
                  : 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-primary hover:bg-muted/50'
            }`}
          >
            {/* Active indicator */}
            {isActive && !mobile && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-primary rounded-full"></div>
            )}
            
            <Icon className={`${mobile ? 'w-5 h-5' : 'w-4 h-4'} ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
            <div className={mobile ? 'flex-1' : ''}>
              <div className={mobile ? 'font-medium' : ''}>{item.label}</div>
              {mobile && (
                <div className={`text-xs ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}>
                  {item.description}
                </div>
              )}
            </div>
            {item.label === "Admin Panel" && (
              <Badge variant="destructive" className="ml-auto shadow-sm">Admin</Badge>
            )}
            {item.badge && item.badge > 0 && (
              <Badge className="ml-auto bg-red-500 text-white animate-pulse shadow-sm">
                {item.badge > 9 ? '9+' : item.badge}
              </Badge>
            )}
          </Link>
        );
      })}
      
      {mobile && (
        <>
          <div className="border-t border-border/50 my-4"></div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 p-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all duration-300 w-full text-left group"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Logout</span>
          </button>
        </>
      )}
    </div>
  );

  if (!user) return null;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block">
        <NavContent />
      </nav>

      {/* Mobile Navigation */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="outline" size="icon">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80">
          <div className="flex flex-col h-full">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-bold text-primary">Western Trust Bank</h2>
                <p className="text-sm text-muted-foreground">
                  {user.user_metadata?.full_name || user.email}
                </p>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <NavContent mobile />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Navigation;