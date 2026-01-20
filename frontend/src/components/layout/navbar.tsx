import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";




import {
  Menu,
  Search,
  User as UserIcon,
  LogOut,
  Moon,
  Sun,
  Home,
  PieChart,
  Settings,
  PlusCircle,
  ChevronDown,
} from 'lucide-react';

interface NavbarProps {
  showSearch?: boolean;
  onSearch?: (query: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ showSearch = true, onSearch }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);


  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Navigation items
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <Home className="h-4 w-4" /> },
    { path: '/sections', label: 'Sections', icon: <PieChart className="h-4 w-4" /> },
    { path: '/analytics', label: 'Analytics', icon: <PieChart className="h-4 w-4" /> },
  ];

  // Quick actions
  const quickActions = [
    { label: 'New Section', icon: <PlusCircle className="h-4 w-4" />, onClick: () => navigate('/sections/new') },
    { label: 'Add Expense', icon: <PlusCircle className="h-4 w-4" />, onClick: () => navigate('/bills/new') },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${scrolled
        ? 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'
        : 'bg-background'
        }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo & Navigation */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="PocketLedger Logo" className="h-10 w-auto" />
              <span className="text-xl font-bold hidden sm:inline-block">
                Pocket<span className="text-primary">Ledger</span>
              </span>
            </Link>


            {/* Desktop Navigation */}
            {user && (
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    variant={location.pathname === item.path ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => navigate(item.path)}
                    className="gap-2"
                  >
                    {item.icon}
                    {item.label}
                  </Button>
                ))}
              </nav>
            )}
          </div>

          {/* Center: Search (Desktop) */}
          {showSearch && user && (
            <div className="hidden md:flex flex-1 max-w-2xl mx-6">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search sections, bills, or tags..."
                    className="pl-10 pr-4 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
            </div>
          )}

          {/* Right: User Menu & Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="hidden sm:inline-flex"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* Quick Actions (Desktop) */}



            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={user.username} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.avatar || user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium">{user.username}</p>
                      <p className="text-xs text-muted-foreground">Personal Account</p>
                    </div>
                    <ChevronDown className="h-4 w-4 hidden md:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    {theme === 'dark' ? (
                      <Sun className="mr-2 h-4 w-4" />
                    ) : (
                      <Moon className="mr-2 h-4 w-4" />
                    )}
                    <span>Toggle Theme</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => setShowLoginModal(true)} className="hidden sm:inline-flex">
                  Login
                </Button>
                <Button onClick={() => setShowRegisterModal(true)}>
                  Get Started
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full">
                  {/* Mobile Logo */}
                  <div className="flex items-center gap-2 pb-6 border-b">
                    <img src="/logo.png" alt="PocketLedger Logo" className="h-12 w-auto" />
                    <div>
                      <span className="text-xl font-bold">
                        Pocket<span className="text-primary">Ledger</span>
                      </span>
                      <p className="text-xs text-muted-foreground">Personal Finance</p>
                    </div>
                  </div>

                  {/* Mobile Search */}
                  {showSearch && user && (
                    <div className="py-4 border-b">
                      <form onSubmit={handleSearch}>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="search"
                            placeholder="Search..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Mobile Navigation */}
                  <nav className="flex-1 py-6">
                    <div className="space-y-1">
                      {user ? (
                        <>
                          {navItems.map((item) => (
                            <Button
                              key={item.path}
                              variant={location.pathname === item.path ? 'secondary' : 'ghost'}
                              className="w-full justify-start gap-3"
                              onClick={() => {
                                navigate(item.path);
                                // Close sheet would be handled by context
                              }}
                            >
                              {item.icon}
                              {item.label}
                            </Button>
                          ))}
                          <div className="pt-6">
                            <p className="text-sm font-medium text-muted-foreground px-3 pb-2">Quick Actions</p>
                            {quickActions.map((action) => (
                              <Button
                                key={action.label}
                                variant="ghost"
                                className="w-full justify-start gap-3"
                                onClick={action.onClick}
                              >
                                {action.icon}
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-3"
                            onClick={() => navigate('/')}
                          >
                            <Home className="h-4 w-4" />
                            Home
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-3"
                            onClick={() => navigate('/login')}
                          >
                            <LogOut className="h-4 w-4" />
                            Login
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-3"
                            onClick={() => navigate('/register')}
                          >
                            <UserIcon className="h-4 w-4" />
                            Register
                          </Button>
                        </>
                      )}
                    </div>
                  </nav>

                  {/* Mobile User Info */}
                  {user && (
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-3 px-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {user.avatar || user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.username}</p>
                          <p className="text-sm text-muted-foreground">Personal Account</p>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button variant="outline" className="flex-1" onClick={() => navigate('/settings')}>
                          Settings
                        </Button>
                        <Button variant="destructive" className="flex-1" onClick={handleLogout}>
                          Logout
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          navigate('/dashboard');
        }}
      />

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={(token) => {
          console.log('User registered with token:', token);
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />
    </header>
  );
};

export default Navbar;