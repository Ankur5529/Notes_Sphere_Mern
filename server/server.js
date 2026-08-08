require("dotenv").config();

// ── Force IPv4 DNS resolution ────────────────────────────────────────────────
// Fixes: "querySrv ECONNREFUSED" on networks that use IPv6 (hotspots, etc.)
// Node 18+ defaults to verbatim (IPv6-first) DNS; this restores IPv4-first behavior.
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

// ── Startup Validation ─────────────────────────────────────────────────────
if (!process.env.JWT_SECRET) {
    console.error("FATAL: JWT_SECRET is not set. Server cannot start securely.");
    process.exit(1);
}


const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
const authRoutes = require("./routes/auth.routes");
const notesRoutes = require("./routes/notes.routes");
const path = require("path");


//MiddleWare
app.use(helmet()); // Set security HTTP headers
app.use(cors({
    origin: process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(",")
        : ["http://localhost:3000"],
    credentials: true,
}));
app.use(express.json());

// Manual NoSQL injection sanitizer (express-mongo-sanitize is incompatible with Express 5)
// Strips $ and . from all req.body keys to prevent injection attacks.
app.use((req, res, next) => {
    if (req.body && typeof req.body === "object") {
        const sanitize = (obj) => {
            for (const key in obj) {
                if (/[$.]/.test(key)) {
                    delete obj[key];
                } else if (typeof obj[key] === "object") {
                    sanitize(obj[key]);
                }
            }
        };
        sanitize(req.body);
    }
    next();
});

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use("/api", limiter);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));



if (process.env.MONGO_URI) {
    mongoose
        .connect(process.env.MONGO_URI)
        .then(() => console.log("MongoDB connected successfully"))
        .catch((err) => console.error("MongoDB connection error:", err.message));
} else {
    console.warn("MONGO_URI not set; skipping MongoDB connection.");
}

// (Moved static serving to bottom)

// ── DB Health Check Middleware ──────────────────────────────────────────────
// Returns a clear 503 if MongoDB is not connected yet,
// instead of a cryptic "server error" reaching the user.
app.use("/api", (req, res, next) => {
    const state = mongoose.connection.readyState;
    // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
    if (state !== 1) {
        return res.status(503).json({
            message: "Database not connected. Please check your MongoDB Atlas cluster — it may be paused or your IP may not be whitelisted.",
        });
    }
    next();
});

app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);

// ── Root Route ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.send("Notes Sphere API is running 🚀");
});

// ── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.message);
    res.status(500).json({ message: "An unexpected server error occurred." });
});


const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is in use. Please use a different port or kill the process using it.`);
    } else {
        console.error("Server error:", err);
    }
});

