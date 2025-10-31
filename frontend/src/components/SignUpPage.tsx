import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Button } from './ui/button';
import { ApiError, signUp } from '../services/api';

interface SignUpPageProps {
    onNavigateToLogin: (options?: { email?: string; message?: string }) => void;
}

interface FormState {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

const initialFormState: FormState = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
};

export function SignUpPage({ onNavigateToLogin }: SignUpPageProps) {
    const [form, setForm] = useState<FormState>(initialFormState);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isSubmitDisabled = useMemo(() => {
        if (isSubmitting) return true;
        if (!form.email || !form.password || !form.confirmPassword) return true;
        if (form.password.length < 6) return true;
        if (form.password !== form.confirmPassword) return true;
        return false;
    }, [form, isSubmitting]);

    const passwordStrength = useMemo(() => {
        const value = form.password;
        if (!value) {
            return { score: 0, label: 'Too weak', color: 'bg-red-300' };
        }

        let score = 0;
        if (value.length >= 8) score += 1;
        if (value.length >= 12) score += 1;
        if (/[A-Z]/.test(value)) score += 1;
        if (/[0-9]/.test(value)) score += 1;
        if (/[^A-Za-z0-9]/.test(value)) score += 1;

        if (score >= 4) {
            return { score, label: 'Strong password', color: 'bg-green-500' };
        }

        if (score >= 3) {
            return { score, label: 'Good password', color: 'bg-yellow-500' };
        }

        if (score >= 2) {
            return { score, label: 'Weak password', color: 'bg-orange-400' };
        }

        return { score, label: 'Too weak', color: 'bg-red-300' };
    }, [form.password]);

    const handleChange = (key: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({
            ...prev,
            [key]: event.target.value,
        }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage(null);

        if (form.password !== form.confirmPassword) {
            setErrorMessage('Passwords do not match.');
            return;
        }

        if (form.password.length < 6) {
            setErrorMessage('Password must be at least 6 characters long.');
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await signUp({
                email: form.email.trim(),
                password: form.password,
                metadata: {
                    firstName: form.firstName.trim() || undefined,
                    lastName: form.lastName.trim() || undefined,
                },
            });

            const successNotice = response.requiresConfirmation
                ? 'Account created. Check your email to confirm before signing in.'
                : 'Account created successfully. You can sign in now.';

            const trimmedEmail = form.email.trim() || undefined;
            setForm(initialFormState);

            onNavigateToLogin({
                email: trimmedEmail,
                message: successNotice,
            });
        } catch (error) {
            if (error instanceof ApiError) {
                if (error.status === 409) {
                    setErrorMessage('An account with this email already exists.');
                } else if (error.status === 400) {
                    setErrorMessage('Please check your inputs and try again.');
                } else {
                    setErrorMessage(
                        'Unable to create your account right now. Please try again later.'
                    );
                }
            } else {
                setErrorMessage('Unable to create your account right now. Please try again later.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6 py-10">
            <div className="w-full max-w-lg">
                <div className="mb-8 text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-orange-600 shadow-sm">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-semibold text-gray-900">
                        Create Your Driver Account
                    </h1>
                    <p className="text-sm text-gray-500 max-w-md mx-auto">
                        Access load assignments, performance insights, and Schneider driver tools
                        with your personalized login.
                    </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl shadow-lg shadow-orange-100/40 p-8 space-y-6">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label
                                    htmlFor="firstName"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    First name
                                </label>
                                <input
                                    id="firstName"
                                    type="text"
                                    value={form.firstName}
                                    onChange={handleChange('firstName')}
                                    placeholder="Alex"
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    autoComplete="given-name"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="lastName"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Last name
                                </label>
                                <input
                                    id="lastName"
                                    type="text"
                                    value={form.lastName}
                                    onChange={handleChange('lastName')}
                                    placeholder="Taylor"
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    autoComplete="family-name"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="email" className="text-sm font-medium text-gray-700">
                                Work email *
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={form.email}
                                onChange={handleChange('email')}
                                placeholder="driver@example.com"
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                autoComplete="email"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="password"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Password *
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    minLength={6}
                                    value={form.password}
                                    onChange={handleChange('password')}
                                    placeholder="••••••••"
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    autoComplete="new-password"
                                />
                                <div className="flex items-center space-x-3 text-xs mt-1">
                                    <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                                        <div
                                            className={`h-full transition-all ${passwordStrength.color}`}
                                            style={{
                                                width: `${Math.min(passwordStrength.score, 5) * 20}%`,
                                            }}
                                        />
                                    </div>
                                    <span className="text-gray-500">{passwordStrength.label}</span>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="confirmPassword"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Confirm password *
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    required
                                    minLength={6}
                                    value={form.confirmPassword}
                                    onChange={handleChange('confirmPassword')}
                                    placeholder="••••••••"
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>

                        <p className="text-xs text-gray-500">
                            Password must be at least 6 characters long. Your information is used to
                            personalize Schneider driver tools and communications.
                        </p>

                        {errorMessage && (
                            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                                {errorMessage}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                            disabled={isSubmitDisabled}
                        >
                            {isSubmitting ? 'Creating Account…' : 'Create Account'}
                        </Button>
                    </form>

                    <div className="text-center text-sm text-gray-500">
                        Already have an account?{' '}
                        <button
                            type="button"
                            onClick={() =>
                                onNavigateToLogin({
                                    email: form.email.trim() || undefined,
                                })
                            }
                            className="text-orange-600 font-medium hover:underline"
                        >
                            Sign in
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
