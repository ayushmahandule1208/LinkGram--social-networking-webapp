import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoutes from "./routes/AuthRoutes.js";
import contactsRoutes from "./routes/ContactRoutes.js";


// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT ;
const databaseURL = process.env.DATABASE_URL;

// CORS setup
app.use(cors({
    origin: [process.env.ORIGIN],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
}));

app.use("/uploads/profiles", express.static("uploads/profiles"));
app.use("/uploads/files", express.static("uploads/files"));

// Middleware
app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactsRoutes);

// Start server
const server = app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

// Connect to MongoDB
mongoose.connect(databaseURL)
    .then(() => console.log('DB Connection successful'))
    .catch(err => console.error('DB Connection error:', err.message));

// Handle uncaught exceptions and unhandled promise rejections
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});

