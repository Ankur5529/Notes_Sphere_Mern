import "./Login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup({ onClose, onOpenLogin, onSucess }) {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSignup = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/auth/signup", {
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
                setError(data.message || "Signup failed");
            }
        } catch (err) {
            console.error("Signup error:", err);
            setError("Server error. Please try again.");
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="login-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>
                    ✖
                </button>
                <h2>SignUp</h2>
                {error && <p className="error-text" style={{ color: 'red' }}>{error}</p>}
                <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button className="login-btn" onClick={handleSignup}>
                    Create Account
                </button>
                <p className=" Switch-text">
                    Already have an account ?{" "}
                    <span className="link-text" onClick={onOpenLogin}>
                        {" "}
                        Login{" "}
                    </span>
                </p>
            </div>
        </div>
    );
}
