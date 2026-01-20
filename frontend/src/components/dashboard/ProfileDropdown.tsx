import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import type { User } from '@/types';

import {
  User as UserIcon,
  Settings,
  CreditCard,
  Bell,
  Shield,
  LogOut,
  Moon,
  Sun,
  Laptop,
  TrendingUp,
  FileText,
  Download,
  HelpCircle,
  Mail,
  Check,
  ChevronRight,
} from 'lucide-react';

interface ProfileDropdownProps {
  user: User;
  className?: string;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user, className }) => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const getInitials = (username: string) => {
    return username.charAt(0).toUpperCase();
  };

  const formatLastLogin = (lastLogin?: string) => {
    if (!lastLogin) return 'Never';
    
    const date = new Date(lastLogin);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={cn('gap-2 px-2', className)}>
          <Avatar className="h-8 w-8 border-2 border-primary/20">
            <AvatarImage src="" alt={user.username} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white font-bold">
              {user.avatar || getInitials(user.username)}
            </AvatarFallback>
          </Avatar>
          
          <div className="hidden md:block text-left">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">{user.username}</p>
              <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                Personal
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Last login: {formatLastLogin(user.lastLogin)}
            </p>
          </div>
          
          <ChevronRight className="hidden md:block h-4 w-4 text-muted-foreground rotate-90" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        {/* Profile Header */}
        <DropdownMenuLabel className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary/30">
              <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-lg font-bold">
                {user.avatar || getInitials(user.username)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold">{user.username}</h3>
                <Badge variant="secondary" className="h-5 text-xs">
                  Free Plan
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Personal Account</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 text-xs">
                  <FileText className="h-3 w-3" />
                  <span>{user.stats.totalSections} sections</span>
                </div>
                <div className="w-px h-3 bg-border" />
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className="h-3 w-3" />
                  <span>{user.stats.totalBills} bills</span>
                </div>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Quick Stats */}
        <div className="px-2 py-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-2xl font-bold text-primary">
                {user.stats.totalSections}
              </p>
              <p className="text-xs text-muted-foreground">Sections</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-2xl font-bold text-green-600">
                {user.stats.totalBills}
              </p>
              <p className="text-xs text-muted-foreground">Bills</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-2xl font-bold">
                ${user.stats.totalSpent.toFixed(0)}
              </p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Main Actions */}
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => handleNavigation('/profile')}>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Profile</span>
            <DropdownMenuShortcut>⇧P</DropdownMenuShortcut>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleNavigation('/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleNavigation('/billing')}>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Billing</span>
            <Badge variant="outline" className="ml-auto text-xs">Free</Badge>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Preferences */}
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <div className="flex items-center">
                {theme === 'dark' ? (
                  <Moon className="mr-2 h-4 w-4" />
                ) : theme === 'light' ? (
                  <Sun className="mr-2 h-4 w-4" />
                ) : (
                  <Laptop className="mr-2 h-4 w-4" />
                )}
                <span>Theme</span>
              </div>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="mr-2 h-4 w-4" />
                <span>Light</span>
                {theme === 'light' && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark</span>
                {theme === 'dark' && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Laptop className="mr-2 h-4 w-4" />
                <span>System</span>
                {theme === 'system' && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent">
            <Bell className="mr-2 h-4 w-4" />
            <span className="flex-1">Notifications</span>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
              className="ml-2 scale-75"
              
            />
          </div>

          <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent">
            <Shield className="mr-2 h-4 w-4" />
            <span className="flex-1">Security Alerts</span>
            <Switch
              checked={securityAlerts}
              onCheckedChange={setSecurityAlerts}
              className="ml-2 scale-75"
            />
          </div>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Data Management */}
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => handleNavigation('/export')}>
            <Download className="mr-2 h-4 w-4" />
            <span>Export Data</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleNavigation('/security')}>
            <Shield className="mr-2 h-4 w-4" />
            <span>Security</span>
            <Badge variant="outline" className="ml-auto text-xs">Token</Badge>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Help & Support */}
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => handleNavigation('/help')}>
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Help & Support</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleNavigation('/feedback')}>
            <Mail className="mr-2 h-4 w-4" />
            <span>Send Feedback</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-red-600 focus:text-red-700"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
          <DropdownMenuShortcut>⇧Q</DropdownMenuShortcut>
        </DropdownMenuItem>

        {/* Footer */}
        <div className="p-2 pt-0">
          <Separator className="mb-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span>Token Auth</span>
            </div>
            <div className="flex items-center gap-1">
              <span>v1.0.0</span>
              <span className="h-1 w-1 rounded-full bg-muted-foreground" />
              <span>Member since {new Date(user.createdAt).getFullYear()}</span>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;