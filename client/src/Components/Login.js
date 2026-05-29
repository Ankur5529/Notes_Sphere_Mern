import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Login.css";
import { API_BASE } from "../config";

export default function Login({ onClose, onOpenSignup, onSucess }) {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [guestLoading, setGuestLoading] = useState(false);

    const handleLogin = async (e) => {
        e?.preventDefault();
        if (!email || !password) {
            setError("Please fill in all fields.");
            return;
        }
        setError("");
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
                onSucess();
                navigate("/dashboard");
                onClose();
            } else {
                // Handle both express-validator errors array and plain message
                if (data.errors && Array.isArray(data.errors)) {
                    setError(data.errors[0].msg);
                } else {
                    setError(data.message || "Login failed. Please check your credentials.");
                }
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGuestLogin = async () => {
        setError("");
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
                onSucess();
                navigate("/dashboard");
                onClose();
            } else {
                setError(data.message || "Guest login failed.");
            }
        } catch (err) {
            console.error("Guest login error:", err);
            setError("Cannot reach the server. Make sure the backend is running on port 5000.");
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

                {error && (
                    <p className="error-text" role="alert" aria-live="polite">
                        {error}
                    </p>
                )}

                <form onSubmit={handleLogin} noValidate>
                    <div className="form-group">
                        <label htmlFor="login-email">Email address</label>
                        <input
                            id="login-email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            aria-required="true"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="login-password">Password</label>
                        <input
                            id="login-password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            aria-required="true"
                        />
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
