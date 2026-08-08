import "./Login.css";
import { useState } from "react";
import { API_BASE } from "../config";

export default function Signup({ onClose, onOpenLogin, onSuccess }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [globalError, setGlobalError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSignup = async (e) => {
        e?.preventDefault();

        // Client-side validation
        const errors = {};
        if (!name.trim()) errors.name = "Name is required.";
        if (!email.trim()) errors.email = "Email is required.";
        else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Please enter a valid email address.";
        if (!password) errors.password = "Password is required.";
        else if (password.length < 6) errors.password = "Password must be at least 6 characters.";
        if (!confirmPassword) errors.confirmPassword = "Confirm your password.";
        else if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match.";

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setGlobalError("");
        setFieldErrors({});
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/api/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Auto-login after successful signup
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                onSuccess();
                onClose();
            } else {
                // Handle validation error array from express-validator
                if (data.errors && Array.isArray(data.errors)) {
                    const serverErrors = {};
                    data.errors.forEach(err => {
                        serverErrors[err.path || err.param] = err.msg;
                    });
                    setFieldErrors(serverErrors);
                } else {
                    setGlobalError(data.message || "Signup failed. Please try again.");
                }
            }
        } catch (err) {
            console.error("Signup error:", err);
            setGlobalError("Network error. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="modal-overlay"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="signup-title"
        >
            <div className="login-modal" onClick={(e) => e.stopPropagation()}>
                <button
                    className="close-btn"
                    onClick={onClose}
                    aria-label="Close sign up modal"
                >
                    ✖
                </button>

                <h2 id="signup-title">Create Account</h2>
                <p className="modal-subtitle">Join Notes Sphere for free today</p>

                {globalError && (
                    <p className="error-text" role="alert" aria-live="polite">
                        {globalError}
                    </p>
                )}

                <form onSubmit={handleSignup} noValidate>
                    <div className="form-group">
                        <label htmlFor="signup-name">Full Name</label>
                        <input
                            id="signup-name"
                            type="text"
                            className={fieldErrors.name ? "input-error" : ""}
                            placeholder="e.g. Ankur Sharma"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: null });
                            }}
                            autoComplete="name"
                            aria-required="true"
                            aria-invalid={!!fieldErrors.name}
                        />
                        {fieldErrors.name && <span className="field-error-text">{fieldErrors.name}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="signup-email">Email address</label>
                        <input
                            id="signup-email"
                            type="email"
                            className={fieldErrors.email ? "input-error" : ""}
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: null });
                            }}
                            autoComplete="email"
                            aria-required="true"
                            aria-invalid={!!fieldErrors.email}
                        />
                        {fieldErrors.email && <span className="field-error-text">{fieldErrors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="signup-password">
                            Password <span className="hint-text">(min. 6 characters)</span>
                        </label>
                        <div className="password-wrapper">
                            <input
                                id="signup-password"
                                type={showPassword ? "text" : "password"}
                                className={fieldErrors.password ? "input-error" : ""}
                                placeholder="Create a strong password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: null });
                                }}
                                autoComplete="new-password"
                                aria-required="true"
                                aria-invalid={!!fieldErrors.password}
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                )}
                            </button>
                        </div>
                        {fieldErrors.password && <span className="field-error-text">{fieldErrors.password}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="signup-confirm-password">Confirm Password</label>
                        <div className="password-wrapper">
                            <input
                                id="signup-confirm-password"
                                type={showConfirmPassword ? "text" : "password"}
                                className={fieldErrors.confirmPassword ? "input-error" : ""}
                                placeholder="Re-enter your password"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: null });
                                }}
                                autoComplete="new-password"
                                aria-required="true"
                                aria-invalid={!!fieldErrors.confirmPassword}
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                                {showConfirmPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                )}
                            </button>
                        </div>
                        {fieldErrors.confirmPassword && <span className="field-error-text">{fieldErrors.confirmPassword}</span>}
                    </div>

                    <button
                        className="login-btn"
                        type="submit"
                        disabled={loading}
                        aria-busy={loading}
                        style={{ marginTop: "8px" }}
                    >
                        {loading ? "Creating Account…" : "Create Account"}
                    </button>
                </form>

                <p className="Switch-text" style={{ marginTop: "20px" }}>
                    Already have an account?{" "}
                    <button
                        className="link-text"
                        onClick={onOpenLogin}
                        aria-label="Open login form"
                    >
                        Sign In
                    </button>
                </p>
            </div>
        </div>
    );
}
