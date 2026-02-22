import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Login.css";
import { API_BASE } from "../config";

export default function Login({ onClose, onOpenSignup, onSucess }) {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user)); // Optional: save user info
                onSucess();
                navigate("/dashboard");
                onClose(); // Close modal
            } else {
                setError(data.message || "Login failed");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("Server error. Please try again.");
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="login-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>
                    ✖
                </button>
                <h2>Login</h2>
                {error && <p className="error-text" style={{ color: 'red' }}>{error}</p>}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button className="login-btn" onClick={handleLogin}>
                    {" "}
                    Login
                </button>
                <p className=" Switch-text">
                    Don't have an account ?{" "}
                    <span className="link-text" onClick={onOpenSignup}>
                        {" "}
                        Signup{" "}
                    </span>
                </p>
            </div>
        </div>
    );
}
