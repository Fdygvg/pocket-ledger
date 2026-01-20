import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

import {
    Home,
    CreditCard,
    DollarSign,
    TrendingUp,
    AlertCircle,
    Coins,
    Banknote,
    Gem,
    Activity,
    BarChart3,
    CircleDollarSign,
    Landmark,
    Briefcase,
} from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const [floatingMoney, setFloatingMoney] = useState<Array<{ id: number; iconIndex: number; x: number; y: number; speed: number }>>([]);

    const moneyIcons = [
        Coins,
        Banknote,
        CreditCard,
        Gem,
        Activity,
        BarChart3,
        DollarSign,
        CircleDollarSign,
        Landmark,
        Briefcase
    ];

    // Generate floating money icons
    useEffect(() => {
        const newFloatingMoney = Array.from({ length: 15 }, (_, i) => ({
            id: i,
            iconIndex: Math.floor(Math.random() * moneyIcons.length),
            x: Math.random() * 100,
            y: Math.random() * 100,
            speed: 0.5 + Math.random() * 1,
        }));
        setFloatingMoney(newFloatingMoney);
    }, []);

    const suggestedRoutes = [
        { path: '/dashboard', label: 'Dashboard', icon: <Home className="h-4 w-4" /> },
        { path: '/', label: 'Home', icon: <Home className="h-4 w-4" /> }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 overflow-hidden relative">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                {floatingMoney.map((money) => {
                    const IconComponent = moneyIcons[money.iconIndex];
                    return (
                        <div
                            key={money.id}
                            className="absolute text-emerald-600/20 dark:text-emerald-400/10 animate-float"
                            style={{
                                left: `${money.x}%`,
                                top: `${money.y}%`,
                                animationDelay: `${money.id * 0.2}s`,
                                animationDuration: `${5 + money.speed * 5}s`,
                            }}
                        >
                            <IconComponent className="h-6 w-6 md:h-8 md:w-8" />
                        </div>
                    );
                })}

                {/* Grid pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.1)_1px,transparent_0)] bg-[length:40px_40px] opacity-10" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 container mx-auto px-4 py-12 md:py-24 flex flex-col items-center justify-center min-h-screen">
                {/* Error Code Display */}
                <div className="relative mb-8">
                    <div className="text-[180px] md:text-[240px] font-bold text-emerald-200 dark:text-emerald-900/30 leading-none">
                        404
                    </div>

                    {/* Money Circle */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                            <div className="h-32 w-32 md:h-40 md:w-40 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center animate-pulse shadow-2xl">
                                <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-white/90 dark:bg-gray-900/90 flex items-center justify-center">
                                    <AlertCircle className="h-16 w-16 text-emerald-600 dark:text-emerald-400" />
                                </div>
                            </div>

                            {/* Rotating Money */}
                            <div className="absolute inset-0 animate-spin-slow">
                                {[Coins, Banknote, CreditCard, DollarSign].map((Icon, i) => (
                                    <div
                                        key={i}
                                        className="absolute text-emerald-500/40 dark:text-emerald-400/20"
                                        style={{
                                            transform: `rotate(${i * 90}deg) translateX(100px) rotate(-${i * 90}deg)`,
                                        }}
                                    >
                                        <Icon className="h-6 w-6" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Message */}
                <div className="text-center max-w-2xl mx-auto mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Funds Not Found
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                        Looks like this page has gone on a spending spree and can't be found.
                        Don't worry, your money is safe with us!
                    </p>

                    {/* Error Path */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full border border-emerald-200 dark:border-emerald-800 mb-6">
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                        <code className="text-sm font-mono text-gray-700 dark:text-gray-300">
                            {location.pathname}
                        </code>
                        <span className="text-xs text-muted-foreground">not found</span>
                    </div>

                    {/* Suggested Routes */}
                    <div className="mb-8">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Try one of these pages instead:
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {suggestedRoutes
                                .filter(route => {
                                    if (route.path === '/dashboard') return isAuthenticated;
                                    if (route.path === '/') return true;
                                    return isAuthenticated;
                                })
                                .map((route) => (
                                    <Button
                                        key={route.path}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigate(route.path)}
                                        className="gap-2 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-900/30"
                                    >
                                        {route.icon}
                                        {route.label}
                                    </Button>
                                ))}
                        </div>
                    </div>
                </div>

                {/* Funny Finance Tips */}
                <div className="mt-12 p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-emerald-100 dark:border-emerald-900 max-w-xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            While you're here, remember:
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span>Save 20% of every paycheck</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span>Track your daily expenses</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span>Budget before you spend</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span>Review finances weekly</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 text-center text-sm text-gray-500 dark:text-gray-400 pb-6">
                <p>PocketLedger • Your personal finance companion</p>
                <p className="text-xs mt-1">Error 404 • Missing Page • Financial Awareness</p>
            </div>

            {/* Add CSS animations */}
            <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.8;
          }
          25% {
            transform: translateY(-20px) rotate(90deg);
          }
          50% {
            transform: translateY(-40px) rotate(180deg);
            opacity: 1;
          }
          75% {
            transform: translateY(-20px) rotate(270deg);
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-float {
          animation: float infinite ease-in-out;
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
        </div>
    );
};

export default NotFound;