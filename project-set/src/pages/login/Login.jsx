import React, { useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import useAuth from '../../hooks/useAuth';

// Roll number -> login email lives ONLY here, in the browser.
// roll "23" becomes "23@classb.local". The roll number is never sent anywhere.
const CLASS_DOMAIN = 'classb.local';

const validateRoll = (value) => {
    if (!value.trim()) return 'Enter your roll number.';
    // if (!/^\d+$/.test(value.trim())) return 'Roll number should be digits only.';
    return '';
};

const validatePassword = (value) => {
    if (!value) return 'Enter your password.';
    return '';
};

const Login = () => {
    const { user, loading, signIn } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // PrivateRoute forwards the page the user was blocked from as router state.
    const redirectTo = location.state || '/';

    const rollRef = useRef(null);
    const passwordRef = useRef(null);

    const [roll, setRoll] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({ roll: '', password: '' });
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // An already-signed-in user should never see the login form.
    if (!loading && user) {
        return <Navigate to={redirectTo} replace />;
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormError('');

        const rollError = validateRoll(roll);
        const passwordError = validatePassword(password);
        setErrors({ roll: rollError, password: passwordError });

        // On error, focus the first invalid field.
        if (rollError) {
            rollRef.current?.focus();
            return;
        }
        if (passwordError) {
            passwordRef.current?.focus();
            return;
        }

        const email = `${roll.trim()}@${CLASS_DOMAIN}`;

        setSubmitting(true);
        try {
            await signIn(email, password);
            navigate(redirectTo, { replace: true });
        } catch {
            // Firebase distinguishes wrong-user vs wrong-password, but telling
            // an attacker which roll numbers exist is a leak. One message for both.
            setFormError('Wrong roll number or password. Please try again.');
            setSubmitting(false);
        }
    };

    const inputClass =
        'h-11 w-full rounded-control border border-border bg-bg px-3 text-ink ' +
        'transition-colors duration-150 ease-[var(--ease-out)] outline-none ' +
        'focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-ring ' +
        'focus-visible:ring-offset-2 focus-visible:ring-offset-surface';

    return (
        <main className="flex min-h-[100dvh] items-center justify-center bg-bg px-4 py-10">
            <div className="w-full max-w-sm">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight text-ink">Benami</h1>
                    <p className="mt-2 text-sm text-muted">
                        Sign in to file a complaint. No one sees who you are.
                    </p>
                </div>

                <form
                    noValidate
                    onSubmit={handleSubmit}
                    aria-busy={submitting}
                    className="rounded-card border border-border bg-surface p-6"
                >
                    {formError && (
                        <div
                            role="alert"
                            className="mb-5 rounded-control bg-danger-bg px-3 py-2 text-sm text-danger"
                        >
                            {formError}
                        </div>
                    )}

                    <div className="mb-4">
                        <label htmlFor="roll" className="mb-1.5 block text-sm font-medium text-ink">
                            Roll number
                        </label>
                        <input
                            id="roll"
                            ref={rollRef}
                            type="text"
                            inputMode="numeric"
                            autoComplete="username"
                            value={roll}
                            onChange={(event) => setRoll(event.target.value)}
                            onBlur={() => setErrors((prev) => ({ ...prev, roll: validateRoll(roll) }))}
                            aria-invalid={!!errors.roll}
                            aria-describedby={errors.roll ? 'roll-error' : 'roll-hint'}
                            className={inputClass}
                        />
                        {errors.roll ? (
                            <p id="roll-error" role="alert" className="mt-1.5 text-sm text-danger">
                                {errors.roll}
                            </p>
                        ) : (
                            <p id="roll-hint" className="mt-1.5 text-sm text-muted">
                                Your class roll number, for example 23.
                            </p>
                        )}
                    </div>

                    <div className="mb-6">
                        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                ref={passwordRef}
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                onBlur={() =>
                                    setErrors((prev) => ({ ...prev, password: validatePassword(password) }))
                                }
                                aria-invalid={!!errors.password}
                                aria-describedby={errors.password ? 'password-error' : undefined}
                                className={inputClass + ' pr-16'}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((shown) => !shown)}
                                aria-pressed={showPassword}
                                className="absolute inset-y-0 right-0 flex items-center rounded-control px-3 text-sm font-medium text-muted transition-colors duration-150 outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                        {errors.password && (
                            <p id="password-error" role="alert" className="mt-1.5 text-sm text-danger">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="h-11 w-full rounded-control bg-accent font-medium text-accent-ink transition-transform duration-150 ease-[var(--ease-out)] outline-none active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {submitting ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>
            </div>
        </main>
    );
};

export default Login;
