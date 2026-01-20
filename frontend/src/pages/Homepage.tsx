import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  BarChart3,
  Lock,
  Smartphone,
  Zap,
  Shield,
  Wallet,
  ShoppingCart,
  Car,
  Gamepad2,
  Lightbulb,
  Clapperboard,
  Fuel,
  ShoppingBag
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";
import { useAuth } from "@/hooks/useAuth";

const Homepage = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const { isAuthenticated } = useAuth();

  const navigate = useNavigate()

  const features = [
    {
      icon: <Lock className="h-6 w-6" />,
      title: "Secure Token Auth",
      description: "No passwords to remember. Your unique token is your key.",
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Smart Budget Tracking",
      description: "Track expenses, set budgets, and visualize spending.",
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Fully Responsive",
      description: "Works perfectly on mobile, tablet, and desktop.",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Lightning Fast",
      description: "Quick and intuitive interface for daily use.",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Privacy First",
      description: "Your data stays on your device. No tracking.",
    },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Simple. Secure.{" "}
              <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
                Personal
              </span>{" "}
              Finance
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
              A privacy-focused expense tracker built just for you. No
              subscriptions, no data mining—just your finances, under your
              control.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {isAuthenticated ? (
                <Button
                  size="lg"
                  onClick={() => navigate("/dashboard")}
                  className="w-full sm:w-auto rounded-full px-8 py-6 text-lg"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    onClick={() => setShowRegisterModal(true)}
                    className="w-full sm:w-auto rounded-full px-8 py-6 text-lg"
                  >
                    Start Tracking Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setShowLoginModal(true)}
                    className="w-full sm:w-auto rounded-full px-8 py-6 text-lg"
                  >
                    I Have a Token
                  </Button>
                </>
              )}
            </div>
            <div className="mt-8 flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                No credit card required
              </div>
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                No email needed
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            {/* Dashboard Preview */}
            <div className="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-2xl">
              <div className="absolute -top-3 -right-3 rounded-full bg-gradient-to-r from-primary to-amber-500 text-white px-3 py-1 text-sm font-medium">
                Live Preview
              </div>

              {/* Mock Dashboard */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">My Budget</h3>
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: 'Groceries', icon: <ShoppingCart className="h-4 w-4" />, spent: 32500.00, budget: 50000.00, percent: 65 },
                    { name: 'Transport', icon: <Car className="h-4 w-4" />, spent: 18000.00, budget: 30000.00, percent: 60 },
                    { name: 'Entertainment', icon: <Gamepad2 className="h-4 w-4" />, spent: 9500.00, budget: 20000.00, percent: 48 },
                    { name: 'Utilities', icon: <Lightbulb className="h-4 w-4" />, spent: 27500.00, budget: 40000.00, percent: 69 }
                  ].map((section, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">{section.name}</span>
                        <div className="text-primary">{section.icon}</div>
                      </div>
                      <div className="text-lg font-bold mb-2">₦{section.spent.toLocaleString()}</div>
                      <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-amber-500 transition-all"
                          style={{ width: `${section.percent}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        ₦{(section.budget - section.spent).toLocaleString()} left
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Recent Transactions</h4>
                    <span className="text-xs text-muted-foreground">This week</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: 'Whole Foods', icon: <ShoppingBag className="h-4 w-4 text-white" />, amount: 23500.00, color: 'bg-green-500' },
                      { name: 'Netflix', icon: <Clapperboard className="h-4 w-4 text-white" />, amount: 15500.00, color: 'bg-red-500' },
                      { name: 'Gas Station', icon: <Fuel className="h-4 w-4 text-white" />, amount: 5200.00, color: 'bg-blue-500' }
                    ].map((transaction, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between hover:bg-muted/50 p-2 rounded-lg transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`h-8 w-8 rounded-full ${transaction.color} flex items-center justify-center`}>
                            {transaction.icon}
                          </div>
                          <span className="text-sm font-medium">{transaction.name}</span>
                        </div>
                        <span className="text-sm font-semibold">-₦{transaction.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-primary/10 blur-2xl"></div>
            <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl"></div>
          </motion.div>
        </div>
      </main>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Built for Personal Use
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to track expenses, nothing you don't.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-2 hover:border-primary/20">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <div className="text-primary">{feature.icon}</div>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-primary/5 to-amber-500/5 border-0">
          <CardContent className="pt-12 pb-12 px-6 md:px-12">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Take Control?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Start tracking your expenses in under a minute. No setup, no
                complications.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {isAuthenticated ? (
                  <Button
                    size="lg"
                    onClick={() => navigate("/dashboard")}
                    className="rounded-full px-8 py-6 text-lg"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                ) : (
                  <>
                    <Button
                      size="lg"
                      onClick={() => setShowRegisterModal(true)}
                      className="rounded-full px-8 py-6 text-lg"
                    >
                      Create Your Ledger
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => setShowLoginModal(true)}
                      className="rounded-full px-8 py-6 text-lg"
                    >
                      Already Have Token
                    </Button>
                  </>
                )}
              </div>
              <p className="mt-6 text-sm text-muted-foreground">
                No email required • 100% free • Privacy focused
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          navigate('/dashboard');
        }}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
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
    </div>
  );
};

export default Homepage;
