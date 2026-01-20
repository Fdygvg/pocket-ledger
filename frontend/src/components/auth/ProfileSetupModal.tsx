import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, Smile, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileSetupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { username: string; avatar: string }) => Promise<void>;
    isLoading?: boolean;
    currentUsername?: string;
    currentAvatar?: string;
}

const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    isLoading = false,
    currentUsername = '',
    currentAvatar = '👤',
}) => {
    const [username, setUsername] = useState(currentUsername);
    const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);
    const [error, setError] = useState<string | null>(null);
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
    const [checkingAvailability, setCheckingAvailability] = useState(false);

    const avatars = [
        '👤', '😊', '😎', '🤖', '🐱', '🦊', '🐶', '🦁', '🐯', '🐼',
        '🐵', '🦄', '🐙', '🦉', '🐳', '🌈', '🎯', '🚀', '🎨', '🎮',
        '🍕', '☕', '🎸', '📚', '⚽', '🎭', '💎', '🌟', '🔥', '💧'
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!username.trim()) {
            setError('Username is required');
            return;
        }

        if (username.length < 3) {
            setError('Username must be at least 3 characters');
            return;
        }

        if (username.length > 30) {
            setError('Username must be less than 30 characters');
            return;
        }

        if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
            setError('Username can only contain letters, numbers, dots, hyphens, and underscores');
            return;
        }

        try {
            await onSubmit({
                username: username.trim(),
                avatar: selectedAvatar,
            });
            handleClose();
        } catch (err: any) {
            setError(err.message || 'Failed to setup profile');
        }
    };

    const handleClose = () => {
        setUsername(currentUsername);
        setSelectedAvatar(currentAvatar);
        setError(null);
        setUsernameAvailable(null);
        setCheckingAvailability(false);
        onClose();
    };

    const checkUsernameAvailability = async () => {
        if (!username.trim() || username.length < 3) return;

        setCheckingAvailability(true);
        setUsernameAvailable(null);

        // Simulate API check (you'll implement actual API call)
        setTimeout(() => {
            // For demo, assume username is available if it contains 'demo' or 'test'
            const isAvailable = !username.toLowerCase().includes('admin') &&
                !username.toLowerCase().includes('root');
            setUsernameAvailable(isAvailable);
            setCheckingAvailability(false);

            if (!isAvailable) {
                setError(`Username "${username}" is already taken`);
            } else {
                setError(null);
            }
        }, 500);
    };

    const formatUsernameExample = (name: string) => {
        if (!name.trim()) return 'johndoe';
        return name.toLowerCase().replace(/[^a-z0-9_.-]/g, '');
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md max-h-[96vh] sm:max-h-[90vh] w-[95vw] sm:w-full flex flex-col p-0 overflow-hidden gap-0">
                <DialogHeader className="p-4 sm:p-6 pb-2 sm:pb-4 border-b">
                    <div className="flex items-center justify-center mb-1 sm:mb-2">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        </div>
                    </div>
                    <DialogTitle className="text-center text-xl sm:text-2xl">Complete Your Profile</DialogTitle>
                    <DialogDescription className="text-center text-xs sm:text-sm">
                        Choose a username and avatar to personalize your account
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <form id="profile-setup-form" onSubmit={handleSubmit} className="space-y-6">
                        {/* Username Input */}
                        <div className="space-y-3">
                            <Label htmlFor="username" className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Username
                            </Label>

                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <Input
                                        id="username"
                                        placeholder="johndoe"
                                        value={username}
                                        onChange={(e) => {
                                            setUsername(e.target.value);
                                            setUsernameAvailable(null);
                                            setError(null);
                                        }}
                                        className={cn(
                                            'flex-1',
                                            usernameAvailable === true && 'border-green-500',
                                            usernameAvailable === false && 'border-red-500'
                                        )}
                                        disabled={isLoading}
                                        maxLength={30}
                                        minLength={3}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={checkUsernameAvailability}
                                        disabled={checkingAvailability || username.length < 3}
                                        className="whitespace-nowrap"
                                    >
                                        {checkingAvailability ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            'Check'
                                        )}
                                    </Button>
                                </div>

                                {/* Username Availability Indicator */}
                                {usernameAvailable !== null && (
                                    <div className={cn(
                                        'flex items-center gap-2 text-sm p-2 rounded',
                                        usernameAvailable
                                            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                            : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                    )}>
                                        {usernameAvailable ? (
                                            <>
                                                <Check className="h-4 w-4" />
                                                Username is available!
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle className="h-4 w-4" />
                                                Username is already taken
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* Username Requirements */}
                                <div className="text-xs text-muted-foreground space-y-1">
                                    <p>Requirements:</p>
                                    <ul className="list-disc list-inside space-y-0.5">
                                        <li className={cn(username.length >= 3 && 'text-green-600')}>
                                            3-30 characters {username.length >= 3 && '✓'}
                                        </li>
                                        <li className={cn(/^[a-zA-Z0-9_.-]+$/.test(username) && 'text-green-600')}>
                                            Letters, numbers, . _ - only {/^[a-zA-Z0-9_.-]+$/.test(username) && '✓'}
                                        </li>
                                        <li>No spaces or special characters</li>
                                    </ul>
                                    <p className="mt-2">
                                        Your profile URL: <span className="font-mono text-primary">
                                            pocketledger.app/{formatUsernameExample(username)}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Avatar Selection */}
                        <div className="space-y-3">
                            <Label className="flex items-center gap-2">
                                <Smile className="h-4 w-4" />
                                Choose an Avatar
                            </Label>

                            <div className="rounded-lg border p-3 sm:p-4">
                                <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                                    {avatars.map((avatar) => (
                                        <button
                                            key={avatar}
                                            type="button"
                                            onClick={() => setSelectedAvatar(avatar)}
                                            className={cn(
                                                'h-12 w-12 rounded-full flex items-center justify-center text-2xl',
                                                'transition-all hover:scale-110 hover:shadow-md',
                                                'border-2',
                                                selectedAvatar === avatar
                                                    ? 'border-primary bg-primary/10 scale-110 shadow-md'
                                                    : 'border-transparent hover:border-muted-foreground/30'
                                            )}
                                            disabled={isLoading}
                                            title={`Select ${avatar}`}
                                        >
                                            {avatar}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="text-center">
                                <div className="inline-flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                    <div className="text-4xl">{selectedAvatar}</div>
                                    <div className="text-left">
                                        <p className="font-medium">Preview</p>
                                        <p className="text-sm text-muted-foreground">
                                            {username.trim() || 'Your username'} will look like this
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Help Text */}
                        <div className="rounded-lg bg-primary/5 p-4 border border-primary/20">
                            <p className="text-sm text-primary font-medium mb-2">Profile Tips:</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                                <li>• Choose a memorable username - you can't change it later</li>
                                <li>• Your avatar is public and visible on your profile</li>
                                <li>• You can always update your avatar later</li>
                                <li>• Profile completion helps personalize your experience</li>
                            </ul>
                        </div>
                    </form>
                </div>

                {/* Actions */}
                <div className="p-4 sm:p-6 pt-2 sm:pt-4 border-t space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            className="flex-1"
                            disabled={isLoading}
                        >
                            Skip for Now
                        </Button>
                        <Button
                            type="submit"
                            form="profile-setup-form"
                            className="flex-1"
                            disabled={isLoading || !username.trim() || username.length < 3}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Setting up...
                                </>
                            ) : (
                                'Complete Profile'
                            )}
                        </Button>
                    </div>

                    {/* Skip Notice */}
                    <div className="text-center pt-2">
                        <p className="text-sm text-muted-foreground">
                            You can skip now and setup your profile later from settings.
                            <br />
                            <span className="text-xs">But your username will remain auto-generated.</span>
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ProfileSetupModal;