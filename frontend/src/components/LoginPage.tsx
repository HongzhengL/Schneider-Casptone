import { FormEvent, useEffect, useState } from 'react';
import { LogIn, ShieldCheck, Truck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { ApiError } from '../services/api';

interface LoginPageProps {
    initialEmail?: string;
    onSwitchToSignUp?: () => void;
    flashMessage?: string | null;
}

export function LoginPage({
    initialEmail = '',
    onSwitchToSignUp,
    flashMessage = null,
}: LoginPageProps) {
    const { login, isAuthenticating } = useAuth();
    const [email, setEmail] = useState(initialEmail);
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [infoMessage, setInfoMessage] = useState<string | null>(flashMessage);

    useEffect(() => {
        setEmail(initialEmail);
    }, [initialEmail]);

    useEffect(() => {
        setInfoMessage(flashMessage);
    }, [flashMessage]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage(null);
        setInfoMessage(null);

        try {
            await login(email.trim(), password, rememberMe);
            setPassword('');
        } catch (error) {
            if (error instanceof ApiError) {
                setErrorMessage(
                    error.status === 401
                        ? 'Invalid email or password. Please try again.'
                        : 'Unable to sign in right now. Please try again later.'
                );
            } else {
                setErrorMessage('Unable to sign in right now. Please try again later.');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
            <div className="w-full max-w-5xl grid lg:grid-cols-[1.15fr_1fr] gap-10 items-center">
                <div className="hidden lg:flex flex-col space-y-6 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white rounded-3xl p-10 shadow-xl shadow-orange-200/60">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/15">
                        <Truck className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-semibold leading-tight">
                        Schneider Driver Portal
                    </h1>
                    <p className="text-orange-100 text-base leading-relaxed">
                        Manage your assignments, track performance, and stay connected with your
                        team. Sign in to access secure tools built for Schneider drivers.
                    </p>
                    <div className="flex items-center space-x-3 pt-3 border-t border-white/20">
                        <ShieldCheck className="w-6 h-6" />
                        <span className="text-sm text-orange-100">
                            Enterprise-grade security with Supabase authentication
                        </span>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-3xl shadow-lg shadow-orange-100/60 p-8 space-y-6">
                    <div className="space-y-3 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-orange-600">
                            <LogIn className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl font-semibold text-gray-900">
                            Sign in to your account
                        </h2>
                        <p className="text-sm text-gray-500 max-w-sm mx-auto">
                            Enter your credentials to access load assignments, wallet details, and
                            driver insights.
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-1.5">
                            <label htmlFor="email" className="text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="driver@example.com"
                                autoComplete="email"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="password" className="text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="••••••••"
                                autoComplete="current-password"
                            />
                        </div>

                        {infoMessage && (
                            <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
                                {infoMessage}
                            </div>
                        )}

                        {errorMessage && (
                            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                                {errorMessage}
                            </div>
                        )}

                        <div className="flex items-center justify-between text-sm">
                            <label className="inline-flex items-center space-x-2 text-gray-600">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                    checked={rememberMe}
                                    onChange={(event) => setRememberMe(event.target.checked)}
                                />
                                <span>Remember me</span>
                            </label>
                            <button
                                type="button"
                                className="text-orange-600 hover:text-orange-700 font-medium"
                                onClick={() => {
                                    setInfoMessage(
                                        'Password reset is not yet available. Please contact support.'
                                    );
                                    setErrorMessage(null);
                                }}
                            >
                                Forgot password?
                            </button>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                            disabled={isAuthenticating}
                        >
                            {isAuthenticating ? 'Signing In…' : 'Sign In'}
                        </Button>
                    </form>

                    <div className="text-center text-sm text-gray-500">
                        Don't have an account yet?{' '}
                        <button
                            type="button"
                            onClick={() => onSwitchToSignUp?.()}
                            className="text-orange-600 font-medium hover:underline"
                        >
                            Create one
                        </button>
                    </div>

                    <p className="text-xs text-gray-400 text-center">
                        By continuing you agree to the Schneider Driver Terms of Service.
                    </p>
                </div>
            </div>
        </div>
    );
}
