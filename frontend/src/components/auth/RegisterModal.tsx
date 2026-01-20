import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Copy, Check, AlertTriangle, Key, Shield, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (token: string) => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { register } = useAuth();
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [step, setStep] = useState<'warning' | 'generating' | 'success'>('warning');

  // Reset state when modal opens is handled by ensuring clean state on close

  const handleGenerateToken = async () => {
    setStep('generating');
    try {
      const token = await register();
      setGeneratedToken(token);
      setStep('success');
      // Do not call onSuccess here, wait for user to copy and click continue
    } catch (error) {
      console.error('Registration failed:', error);
      setStep('warning');
    }
  };

  const copyToClipboard = async () => {
    if (!generatedToken) return;

    try {
      await navigator.clipboard.writeText(generatedToken);
      setCopied(true);
      setHasCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleContinue = () => {
    if (generatedToken) {
      onSuccess?.(generatedToken);
      // We don't necessarily need to close here if onSuccess handles it, 
      // but if onSuccess just logs or something, we might want to ensure close.
      // However, usually onSuccess in parent triggers state change that closes modal.
      // Based on Homepage.tsx, onSuccess closes the modal.
      // But to be safe and consistent with "btn...should close", we can ensure it?
      // Homepage.tsx: setShowRegisterModal(false); so it will close.
    }
  };

  const handleClose = () => {
    // Small delay to allow fade out animation before resetting state
    onClose();
    setTimeout(() => {
      setGeneratedToken(null);
      setCopied(false);
      setHasCopied(false);
      setStep('warning');
    }, 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        {step === 'warning' && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-center mb-2">
                <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <DialogTitle className="text-center text-2xl">⚠️ Critical Security Notice</DialogTitle>
              <DialogDescription className="text-center">
                Read this carefully before proceeding
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>This token is your only key</AlertTitle>
                <AlertDescription>
                  If you lose this token, you <strong>cannot recover</strong> your account.
                  There is no "forgot password" option.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <p className="text-sm">
                    <strong>Save it immediately:</strong> Copy the token and store it in a password manager or secure location.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <p className="text-sm">
                    <strong>Never share it:</strong> This token gives full access to your account and all your financial data.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <p className="text-sm">
                    <strong>No email recovery:</strong> We don't collect emails. If you lose the token, your account is permanently lost.
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm font-medium mb-2">Recommended storage methods:</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Password manager (Bitwarden, 1Password, etc.)</li>
                  <li>Encrypted note on your device</li>
                  <li>Printed and stored in a safe place</li>
                  <li>Never store in plain text files or emails</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleGenerateToken}
                className="flex-1"
              >
                I Understand, Generate Token
              </Button>
            </div>
          </>
        )}

        {step === 'generating' && (
          <div className="py-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center mb-4">
                <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              </div>
              <DialogTitle className="text-xl mb-2">Generating Secure Token</DialogTitle>
              <DialogDescription>
                Creating your unique 64-character access token...
              </DialogDescription>
              <div className="mt-6">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              </div>
            </div>
          </div>
        )}

        {step === 'success' && generatedToken && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-center mb-2">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Key className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <DialogTitle className="text-center text-2xl flex items-center justify-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                Token Generated Successfully
              </DialogTitle>
              <DialogDescription className="text-center">
                Copy and save this token immediately
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20">
                <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-300">
                  <strong>This is your only chance to copy the token!</strong> It will not be shown again.
                </AlertDescription>
              </Alert>

              {/* Token Display */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Your Access Token</span>
                  <span className="text-xs text-muted-foreground">64 characters</span>
                </div>
                <div className="relative">
                  <div className="font-mono text-sm bg-muted/50 p-4 rounded-lg border break-all">
                    {generatedToken}
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={copyToClipboard}
                    className="absolute right-2 top-2"
                  >
                    {copied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Usage Instructions */}
              <div className="rounded-lg bg-primary/5 p-4 border border-primary/20">
                <p className="text-sm font-medium text-primary mb-2">What to do next:</p>
                <ol className="text-xs space-y-2 list-decimal list-inside">
                  <li>
                    <strong>Save the token</strong> in your password manager or secure location
                  </li>
                  <li>
                    <strong>Use this token</strong> to login on any device
                  </li>
                  <li>
                    After login, you'll set up your username and profile
                  </li>
                  <li>
                    The token will be saved in a secure cookie for future sessions
                  </li>
                </ol>
              </div>

              {/* Final Warning */}
              <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-4 border border-amber-200 dark:border-amber-800">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Last Chance Warning
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                  Once you close this dialog, this token will never be displayed again.
                  Make sure you've saved it!
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => copyToClipboard()}
                className="flex-1"
              >
                Copy Again
              </Button>
              <Button
                type="button"
                onClick={handleContinue}
                disabled={!hasCopied}
                className="flex-1"
              >
                I've Saved It, Continue
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RegisterModal;