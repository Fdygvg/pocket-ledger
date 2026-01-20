import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import type {
    User,
    AuthResponse,
    RegisterResponse,
    ProfileSetupData,
    PreferencesData,
} from '@/types';

interface AuthContextType {
    // State
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;

    // Actions
    login: (token: string) => Promise<void>;
    logout: () => Promise<void>;
    register: () => Promise<string>;
    setupProfile: (data: ProfileSetupData) => Promise<void>;
    updatePreferences: (data: PreferencesData) => Promise<void>;
    refreshUser: () => Promise<void>;

    // Utilities
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Check for existing session on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await api.get<AuthResponse['data']>('/auth/me');
                if (response.success && response.data?.user) {
                    setUser(response.data.user);
                }
            } catch (err: unknown) {
                console.error(err);
                // Clear invalid session
                await api.post('/auth/logout');
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = useCallback(async (token: string): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await api.post<AuthResponse['data']>('/auth/login', {
                accessToken: token,
            });

            if (!response.success) {
                throw new Error(response.error || 'Login failed');
            }

            if (!response.data?.user) {
                throw new Error('No user data received');
            }

            setUser(response.data.user);
            navigate('/dashboard');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Login failed. Please check your token.';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);

    const logout = useCallback(async (): Promise<void> => {
        setIsLoading(true);

        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setUser(null);
            setIsLoading(false);
            navigate('/');
        }
    }, [navigate]);

    const register = useCallback(async (): Promise<string> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await api.post<RegisterResponse['data']>('/auth/register');

            if (!response.success) {
                throw new Error(response.error || 'Registration failed');
            }

            if (!response.data?.accessToken) {
                throw new Error('No access token received');
            }

            // Save token temporarily (user needs to copy it)
            const token = response.data.accessToken;

            // Store token in memory for immediate login if desired
            sessionStorage.setItem('pending_token', token);

            return token;
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Registration Failed.';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const setupProfile = useCallback(async (data: ProfileSetupData): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await api.post<AuthResponse['data']>('/auth/setup-profile', data);

            if (!response.success) {
                throw new Error(response.error || 'Profile setup failed');
            }

            if (!response.data?.user) {
                throw new Error('No user data received');
            }

            setUser(response.data.user);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Profile Setup Failed.';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updatePreferences = useCallback(async (data: PreferencesData): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await api.put<AuthResponse['data']>('/auth/preferences', data);

            if (!response.success) {
                throw new Error(response.error || 'Preferences update failed');
            }

            if (!response.data?.user) {
                throw new Error('No user data received');
            }

            setUser(response.data.user);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Preference Update Failed.';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const refreshUser = useCallback(async (): Promise<void> => {
        try {
            const response = await api.get<AuthResponse['data']>('/auth/me');

            if (response.success && response.data?.user) {
                setUser(response.data.user);
            } else {
                setUser(null);
            }
        } catch (err) {
            setUser(null);
            console.error('Failed to refresh user:', err);
        }
    }, []);

    const clearError = useCallback((): void => {
        setError(null);
    }, []);

    const value: AuthContextType = {
        // State
        user,
        isLoading,
        isAuthenticated: !!user,
        error,

        // Actions
        login,
        logout,
        register,
        setupProfile,
        updatePreferences,
        refreshUser,

        // Utilities
        clearError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
