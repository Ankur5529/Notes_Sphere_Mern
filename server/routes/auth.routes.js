const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const User = require("../models/User");

// ── Auth-specific rate limiter (5 attempts / 15 min) ─────────────────────────
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: "Too many attempts. Please try again in 15 minutes." },
    skipSuccessfulRequests: true,
});

// ── Guest Login ───────────────────────────────────────────────────────────────
// POST /api/auth/guest-login
// Finds or creates a permanent demo account and issues a short-lived token.
router.post("/guest-login", async (req, res) => {
    try {
        const GUEST_EMAIL = process.env.GUEST_EMAIL || "guest@notessphere.demo";
        const GUEST_PASSWORD = process.env.GUEST_PASSWORD || "GuestDemo@123";
        const GUEST_NAME = "Guest User";

        let guest = await User.findOne({ email: GUEST_EMAIL });
        if (!guest) {
            const hashedPassword = await bcrypt.hash(GUEST_PASSWORD, 10);
            guest = await User.create({
                name: GUEST_NAME,
                email: GUEST_EMAIL,
                password: hashedPassword,
            });
        }

        const token = jwt.sign(
            { id: guest._id },
            process.env.JWT_SECRET,
            { expiresIn: "4h" }
        );

        res.json({
            msg: "Guest login successful",
            token,
            isGuest: true,
            user: { id: guest._id, name: guest.name, email: guest.email },
        });
    } catch (error) {
        console.error("Guest login error:", error);
        res.status(500).json({ message: "Server error during guest login." });
    }
});

// ── Sign Up ───────────────────────────────────────────────────────────────────
// POST /api/auth/signup
router.post(
    "/signup",
    authLimiter,
    [
        body("name").notEmpty().trim().withMessage("Name is required"),
        body("email").isEmail().normalizeEmail().withMessage("Please include a valid email"),
        body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    ],
    async (req, res) => {
        // Return validation errors immediately
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { name, email, password } = req.body;

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: "An account with this email already exists." });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await User.create({ name, email, password: hashedPassword });

            const token = jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET,
                { expiresIn: "2d" }
            );

            res.status(201).json({
                msg: "Signup successful",
                token,
                user: { id: user._id, name: user.name, email: user.email },
            });
        } catch (error) {
            console.error("Signup error:", error);
            res.status(500).json({ message: "Server error during signup. Please try again." });
        }
    }
);

// ── Login ─────────────────────────────────────────────────────────────────────
// POST /api/auth/login
router.post(
    "/login",
    authLimiter,
    [
        body("email").isEmail().normalizeEmail().withMessage("Please include a valid email"),
        body("password").notEmpty().withMessage("Password is required"),
    ],
    async (req, res) => {
        // Return validation errors immediately
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: "Invalid email or password." });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Invalid email or password." });
            }

            const token = jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET,
                { expiresIn: "2d" }
            );

            res.json({
                msg: "Login successful",
                token,
                user: { id: user._id, name: user.name, email: user.email },
            });
        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ message: "Server error during login. Please try again." });
        }
    }
);

module.exports = router;
