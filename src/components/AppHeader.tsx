import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  Home,
  CreditCard,
  Plus,
  Minus,
  ArrowLeftRight,
  FileText,
  Shield,
  LogOut,
  User,
  Bell,
  Calendar,
  Download,
  BarChart3,
  RefreshCw,
  Headphones,
  ChevronDown,
  Building2,
  Wallet,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/useNotifications";
import { useAdminRole } from "@/hooks/useAdminRole";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

const AppHeader = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    navigate("/");
    setMobileOpen(false);
  };

  if (user) {
    return <AuthenticatedHeader user={user} onLogout={handleLogout} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} location={location} />;
  }

  return <GuestHeader mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />;
};

/* ─── Guest Header ─── */
const GuestHeader = ({ mobileOpen, setMobileOpen }: { mobileOpen: boolean; setMobileOpen: (v: boolean) => void }) => {
  const guestLinks = [
    { label: "About", path: "/about" },
    { label: "Services", path: "/services" },
    { label: "FAQ", path: "/faq" },
    { label: "Contact", path: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-card/80 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="shrink-0">
            <Logo size="sm" />
          </Link>

          {/* Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {guestLinks.map((l) => (
              <Link
                key={l.path}
                to={l.path}
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild size="sm" className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-elegant">
              <Link to="/auth" className="flex items-center gap-1.5">
                Get Started <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>

          {/* Mobile trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <div className="flex flex-col h-full">
                <div className="p-5 border-b border-border/60">
                  <Logo size="sm" />
                </div>
                <nav className="flex-1 p-4 space-y-1">
                  {guestLinks.map((l) => (
                    <Link
                      key={l.path}
                      to={l.path}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                    >
                      {l.label}
                    </Link>
                  ))}
                </nav>
                <div className="p-4 border-t border-border/60 space-y-2">
                  <Link to="/auth" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full">Sign In</Button>
                  </Link>
                  <Link to="/auth" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full bg-gradient-primary text-primary-foreground mt-2">Get Started</Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

/* ─── Authenticated Header ─── */
interface AuthHeaderProps {
  user: any;
  onLogout: () => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
  location: any;
}

const navGroups = {
  banking: [
    { label: "Dashboard", path: "/dashboard", icon: Home },
    { label: "Deposit", path: "/deposit", icon: Plus },
    { label: "Withdraw", path: "/withdraw", icon: Minus },
    { label: "Transfer", path: "/transfer", icon: ArrowLeftRight },
    { label: "External Transfer", path: "/external-transfer", icon: Building2 },
    { label: "Recurring", path: "/recurring-transfers", icon: Calendar },
  ],
  manage: [
    { label: "Cards", path: "/cards", icon: CreditCard },
    { label: "Payment Methods", path: "/payment-methods", icon: Wallet },
    { label: "Bills", path: "/bills", icon: FileText },
    { label: "Statements", path: "/statements", icon: Download },
  ],
  invest: [
    { label: "Portfolio", path: "/portfolio", icon: BarChart3 },
    { label: "Exchange", path: "/currency-exchange", icon: RefreshCw },
  ],
};

const AuthenticatedHeader = ({ user, onLogout, mobileOpen, setMobileOpen, location }: AuthHeaderProps) => {
  const { unreadCount } = useNotifications();
  const { isAdmin } = useAdminRole();
  const initials = (user.user_metadata?.full_name || user.email || "U")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isActive = (path: string) => location.pathname === path;

  const allMobileItems = [
    ...navGroups.banking,
    ...navGroups.manage,
    ...navGroups.invest,
    { label: "Support", path: "/support", icon: Headphones },
    { label: "Notifications", path: "/notifications", icon: Bell },
    { label: "Profile", path: "/profile", icon: User },
    ...(isAdmin ? [{ label: "Admin Panel", path: "/admin", icon: Shield }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-card/80 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 lg:h-16">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="shrink-0">
              <Logo size="sm" />
            </Link>

            {/* Desktop nav groups */}
            <nav className="hidden lg:flex items-center gap-1">
              {/* Dashboard direct link */}
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive("/dashboard")
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                Dashboard
              </Link>

              {/* Banking dropdown */}
              <NavDropdown
                label="Banking"
                icon={Wallet}
                items={navGroups.banking.filter((i) => i.path !== "/dashboard")}
                location={location}
              />

              {/* Manage dropdown */}
              <NavDropdown label="Manage" icon={FileText} items={navGroups.manage} location={location} />

              {/* Invest dropdown */}
              <NavDropdown label="Invest" icon={BarChart3} items={navGroups.invest} location={location} />

              <Link
                to="/support"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive("/support")
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                Support
              </Link>
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Notification bell */}
            <Link to="/notifications" className="relative p-2 rounded-lg hover:bg-muted/50 transition-colors hidden sm:flex">
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            {/* Admin badge */}
            {isAdmin && (
              <Link to="/admin" className="hidden md:flex">
                <Badge variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10 cursor-pointer transition-colors">
                  <Shield className="w-3 h-3 mr-1" /> Admin
                </Badge>
              </Link>
            )}

            {/* User avatar dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-muted/50 transition-all duration-200 outline-none">
                  <Avatar className="h-8 w-8 border-2 border-primary/20">
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.user_metadata?.full_name || "User"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/notifications" className="cursor-pointer">
                      <Bell className="mr-2 h-4 w-4" /> Notifications
                      {unreadCount > 0 && <Badge className="ml-auto bg-destructive text-destructive-foreground text-[10px] h-5">{unreadCount}</Badge>}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-destructive cursor-pointer focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0">
                <div className="flex flex-col h-full">
                  {/* User info */}
                  <div className="p-5 border-b border-border/60 bg-gradient-subtle">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-primary/30">
                        <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm font-bold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{user.user_metadata?.full_name || "User"}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Nav items */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
                    {allMobileItems.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                            active
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          }`}
                        >
                          <Icon className={`w-4.5 h-4.5 ${active ? "text-primary" : ""}`} />
                          <span>{item.label}</span>
                          {item.label === "Notifications" && unreadCount > 0 && (
                            <Badge className="ml-auto bg-destructive text-destructive-foreground text-[10px] h-5 px-1.5">
                              {unreadCount > 9 ? "9+" : unreadCount}
                            </Badge>
                          )}
                          {item.label === "Admin Panel" && (
                            <Badge variant="destructive" className="ml-auto text-[10px] h-5">Admin</Badge>
                          )}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Logout */}
                  <div className="p-3 border-t border-border/60">
                    <button
                      onClick={onLogout}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-200"
                    >
                      <LogOut className="w-4.5 h-4.5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

/* ─── Desktop Nav Dropdown ─── */
interface NavDropdownProps {
  label: string;
  icon: any;
  items: { label: string; path: string; icon: any }[];
  location: any;
}

const NavDropdown = ({ label, icon: GroupIcon, items, location }: NavDropdownProps) => {
  const hasActive = items.some((i) => location.pathname === i.path);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 outline-none ${
            hasActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          {label}
          <ChevronDown className="w-3.5 h-3.5 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        {items.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <DropdownMenuItem key={item.path} asChild>
              <Link
                to={item.path}
                className={`cursor-pointer ${active ? "bg-primary/5 text-primary" : ""}`}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AppHeader;
