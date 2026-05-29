import "./Login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";

export default function Signup({ onClose, onOpenLogin, onSucess }) {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e) => {
        e?.preventDefault();

        // Client-side validation
        if (!name.trim() || !email.trim() || !password || !confirmPassword) {
            setError("Please fill in all fields.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setError("");
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/api/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                onSucess();
                onClose();
                navigate("/dashboard");
            } else {
                // Handle validation error array from express-validator
                if (data.errors && Array.isArray(data.errors)) {
                    setError(data.errors[0].msg);
                } else {
                    setError(data.message || "Signup failed. Please try again.");
                }
            }
        } catch (err) {
            console.error("Signup error:", err);
            setError("Network error. Please check your connection and try again.");
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

                {error && (
                    <p className="error-text" role="alert" aria-live="polite">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSignup} noValidate>
                    <div className="form-group">
                        <label htmlFor="signup-name">Full Name</label>
                        <input
                            id="signup-name"
                            type="text"
                            placeholder="e.g. Ankur Sharma"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoComplete="name"
                            aria-required="true"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="signup-email">Email address</label>
                        <input
                            id="signup-email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            aria-required="true"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="signup-password">
                            Password <span className="hint-text">(min. 6 characters)</span>
                        </label>
                        <input
                            id="signup-password"
                            type="password"
                            placeholder="Create a strong password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                            aria-required="true"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="signup-confirm-password">Confirm Password</label>
                        <input
                            id="signup-confirm-password"
                            type="password"
                            placeholder="Re-enter your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            autoComplete="new-password"
                            aria-required="true"
                        />
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
