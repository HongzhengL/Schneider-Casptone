import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import {
    fetchCurrentUser,
    login as loginRequest,
    logout as logoutRequest,
    ApiError,
} from '../services/api';
import type { SupabaseUser } from '../types/api';

interface AuthContextValue {
    user: SupabaseUser | null;
    isAuthenticated: boolean;
    isInitializing: boolean;
    isAuthenticating: boolean;
    login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    const refreshUser = useCallback(async () => {
        try {
            const { user: currentUser } = await fetchCurrentUser();
            setUser(currentUser);
        } catch (error) {
            if (error instanceof ApiError && error.status === 401) {
                setUser(null);
            } else {
                console.warn('Unable to load user profile', error);
                setUser(null);
            }
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        const initialize = async () => {
            try {
                const { user: currentUser } = await fetchCurrentUser();
                if (isMounted) {
                    setUser(currentUser);
                }
            } catch {
                if (isMounted) {
                    setUser(null);
                }
            } finally {
                if (isMounted) {
                    setIsInitializing(false);
                }
            }
        };

        initialize();

        return () => {
            isMounted = false;
        };
    }, []);

    const login = useCallback(async (email: string, password: string, rememberMe: boolean) => {
        setIsAuthenticating(true);
        try {
            const response = await loginRequest(email, password, rememberMe);
            setUser(response.user);
        } catch (error) {
            setUser(null);
            throw error;
        } finally {
            setIsAuthenticating(false);
        }
    }, []);

    const logout = useCallback(async () => {
        setIsAuthenticating(true);
        try {
            await logoutRequest();
        } catch (error) {
            if (error instanceof ApiError) {
                console.warn('Logout request failed', error.status);
            } else {
                console.warn('Logout request failed', error);
            }
        } finally {
            setUser(null);
            setIsAuthenticating(false);
        }
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            isAuthenticated: Boolean(user),
            isInitializing,
            isAuthenticating,
            login,
            logout,
            refreshUser,
        }),
        [user, isInitializing, isAuthenticating, login, logout, refreshUser]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
