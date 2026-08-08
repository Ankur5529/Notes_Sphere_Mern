import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Login.css";
import { API_BASE } from "../config";

export default function Login({ onClose, onOpenSignup, onSuccess }) {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [globalError, setGlobalError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [guestLoading, setGuestLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e?.preventDefault();
        
        const errors = {};
        if (!email) errors.email = "Email is required.";
        else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Please enter a valid email address.";
        if (!password) errors.password = "Password is required.";

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setGlobalError("");
        setFieldErrors({});
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                onSuccess();
                navigate("/dashboard");
                onClose();
            } else {
                // Handle express-validator errors array
                if (data.errors && Array.isArray(data.errors)) {
                    const serverErrors = {};
                    data.errors.forEach(err => {
                        serverErrors[err.path || err.param] = err.msg;
                    });
                    setFieldErrors(serverErrors);
                } else {
                    setGlobalError(data.message || "Login failed. Please check your credentials.");
                }
            }
        } catch (err) {
            console.error("Login error:", err);
            setGlobalError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGuestLogin = async () => {
        setGlobalError("");
        setFieldErrors({});
        setGuestLoading(true);
        try {
            const response = await fetch(`${API_BASE}/api/auth/guest-login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify({ ...data.user, isGuest: true }));
                onSuccess();
                navigate("/dashboard");
                onClose();
            } else {
                setGlobalError(data.message || "Guest login failed.");
            }
        } catch (err) {
            console.error("Guest login error:", err);
            setGlobalError("Cannot reach the server. Make sure the backend is running on port 5000.");
        } finally {
            setGuestLoading(false);
        }
    };

    return (
        /* Trap focus and allow Escape to close */
        <div
            className="modal-overlay"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-title"
        >
            <div
                className="login-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="close-btn"
                    onClick={onClose}
                    aria-label="Close login modal"
                >
                    ✖
                </button>

                <h2 id="login-title">Welcome Back</h2>
                <p className="modal-subtitle">Sign in to your account to continue</p>

                {globalError && (
                    <p className="error-text" role="alert" aria-live="polite">
                        {globalError}
                    </p>
                )}

                <form onSubmit={handleLogin} noValidate>
                    <div className="form-group">
                        <label htmlFor="login-email">Email address</label>
                        <input
                            id="login-email"
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
                        <label htmlFor="login-password">Password</label>
                        <div className="password-wrapper">
                            <input
                                id="login-password"
                                type={showPassword ? "text" : "password"}
                                className={fieldErrors.password ? "input-error" : ""}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: null });
                                }}
                                autoComplete="current-password"
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

                    <button
                        className="login-btn"
                        type="submit"
                        disabled={loading}
                        aria-busy={loading}
                    >
                        {loading ? "Signing in…" : "Sign In"}
                    </button>
                </form>

                {/* Divider */}
                <div className="divider" aria-hidden="true">
                    <span>or</span>
                </div>

                {/* Guest Login Button */}
                <button
                    className="guest-btn"
                    onClick={handleGuestLogin}
                    disabled={guestLoading}
                    aria-busy={guestLoading}
                    aria-label="Continue as guest without creating an account"
                >
                    {guestLoading ? "Loading…" : "👤 Continue as Guest"}
                </button>

                <p className="Switch-text">
                    Don't have an account?{" "}
                    <button
                        className="link-text"
                        onClick={onOpenSignup}
                        aria-label="Open sign up form"
                    >
                        Sign Up
                    </button>
                </p>
            </div>
        </div>
    );
}
