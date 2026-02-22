require("dotenv").config();
console.log("ENV MONGO_URI =", process.env.MONGO_URI);


const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const authRoutes = require("./routes/auth.routes");
const notesRoutes = require("./routes/notes.routes");
const path = require("path");


//MiddleWare
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));



if (process.env.MONGO_URI) {
    mongoose
        .connect(process.env.MONGO_URI)
        .then(() => console.log("MongoDB connected successfully"))
        .catch((err) => console.error("MongoDB connection error:", err.message));
} else {
    console.warn("MONGO_URI not set; skipping MongoDB connection.");
}

//Test route
app.get('/', (req, res) => {
    res.send("Notes Sphere Backend is running 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);


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

