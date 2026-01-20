import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Key, Eye, EyeOff, Copy, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onSwitchToRegister,
}) => {
  const { login, isLoading, error: authError } = useAuth();
  const [accessToken, setAccessToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!accessToken.trim()) {
      setError("Please enter your access token");
      return;
    }

    try {
      await login(accessToken.trim());
      onSuccess?.();
      onClose();
      resetForm();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Login failed. Please check your token.";
      setError(errorMessage);
    }
  };

  const resetForm = () => {
    setAccessToken("");
    setError(null);
    setShowToken(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(accessToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Key className="h-6 w-6 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Access Your Account
          </DialogTitle>
          <DialogDescription className="text-center">
            Enter your 64-character access token to login
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Token Input */}
          <div className="space-y-2">
            <Label htmlFor="accessToken">Access Token</Label>
            <div className="relative">
              <Input
                id="accessToken"
                type={showToken ? "text" : "password"}
                placeholder="Enter your 64-character token"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                className={cn(
                  "pr-20 font-mono text-sm",
                  accessToken.length === 64 && "border-green-500"
                )}
                disabled={isLoading}
                autoComplete="off"
                spellCheck="false"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {accessToken && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={copyToClipboard}
                    className="h-8 w-8"
                    title="Copy token"
                  >
                    <Copy
                      className={cn("h-4 w-4", copied && "text-green-500")}
                    />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowToken(!showToken)}
                  className="h-8 w-8"
                  title={showToken ? "Hide token" : "Show token"}
                >
                  {showToken ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Token must be exactly 64 characters</span>
              <span>{accessToken.length}/64</span>
            </div>
          </div>

          {/* Error Display */}
          {(error || authError) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error || authError}</AlertDescription>
            </Alert>
          )}

          {/* Help text */}
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Where to find your token:</strong>
            </p>
            <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
              <li>You received it when you registered</li>
              <li>Check your password manager or secure notes</li>
              <li>Token format: 64 hexadecimal characters (a-f, 0-9)</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <div
              className={`text-xs ${accessToken.length === 64 ? "text-green-500" : "text-red-500"
                }`}
            >
              Token length: {accessToken.length}/64
              {accessToken.length !== 64
                ? " (Must be exactly 64 characters!)"
                : " ✓"}
            </div>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading || accessToken.length !== 64}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </div>

          {/* Register Link */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto font-semibold"
                onClick={() => {
                  handleClose();
                  onSwitchToRegister?.();
                }}
              >
                Register here
              </Button>
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
