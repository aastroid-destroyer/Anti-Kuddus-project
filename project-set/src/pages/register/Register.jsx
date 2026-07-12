import { useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import useAuth from '../../hooks/useAuth';

// Same roll-number-to-email convention as Login. The roll number is turned
// into an email in the browser and never sent anywhere on its own.
const CLASS_DOMAIN = 'classb.local';

const validateRoll = (value) => {
    if (!value.trim()) return 'Enter your roll number.';
    return '';
};

const validatePassword = (value) => {
    if (!value) return 'Create a password.';
    if (value.length < 6) return 'Use at least 6 characters.';
    return '';
};

const Register = () => {
    const { user, loading, createUser } = useAuth();
    const navigate = useNavigate();

    const rollRef = useRef(null);
    const passwordRef = useRef(null);

    const [roll, setRoll] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({ roll: '', password: '' });
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // An already-signed-in user should never see the register form.
    if (!loading && user) {
        return <Navigate to="/" replace />;
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormError('');

        const rollError = validateRoll(roll);
        const passwordError = validatePassword(password);
        setErrors({ roll: rollError, password: passwordError });

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
            await createUser(email, password);
            navigate('/', { replace: true });
        } catch (error) {
            // The most common failure is a roll number that already has an
            // account; anything else falls back to a generic message.
            setFormError(
                error?.code === 'auth/email-already-in-use'
                    ? 'That roll number is already registered. Try logging in.'
                    : 'Could not create your account. Please try again.',
            );
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
                    <h1 className="text-2xl font-semibold tracking-tight text-ink">
                        Create your account
                    </h1>
                    <p className="mt-2 text-sm text-muted">
                        Sign up to file a complaint. No one sees who you are.
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
                                autoComplete="new-password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                onBlur={() =>
                                    setErrors((prev) => ({ ...prev, password: validatePassword(password) }))
                                }
                                aria-invalid={!!errors.password}
                                aria-describedby={errors.password ? 'password-error' : 'password-hint'}
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
                        {errors.password ? (
                            <p id="password-error" role="alert" className="mt-1.5 text-sm text-danger">
                                {errors.password}
                            </p>
                        ) : (
                            <p id="password-hint" className="mt-1.5 text-sm text-muted">
                                At least 6 characters.
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="h-11 w-full rounded-control bg-accent font-medium text-accent-ink transition-transform duration-150 ease-[var(--ease-out)] outline-none active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {submitting ? 'Creating account...' : 'Sign up'}
                    </button>
                </form>

                <p className="mt-5 text-center text-sm text-muted">
                    Already have an account?{' '}
                    <Link
                        to="/login"
                        className="rounded-control font-medium text-accent outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        Log in
                    </Link>
                </p>
            </div>
        </main>
    );
};

export default Register;
