const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");

require("dotenv").config({ path: __dirname + "/.env" });

const connectDB = require("./config/db");
const { apiLimiter } = require("./middleware");
const { CITIES, CATEGORIES } = require("./constants/property");

const propertiesRouter = require("./routes/properties");
const authRouter = require("./routes/auth");
const contactRouter = require("./routes/contact");

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

// ── الأمان ───────────────────────────────────────────────
app.use(helmet());

const allowedOrigins = [
  "https://real-state-six-chi.vercel.app",
  "http://localhost:5173"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

app.use("/api/", apiLimiter);

app.use(mongoSanitize());

// ── الـ Body Parsing ──────────────────────────────────────
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── الراوتات ──────────────────────────────────────────────
app.use("/api/properties", propertiesRouter);
app.use("/api/auth", authRouter);
app.use("/api/contact", contactRouter);

app.get("/api/cities", (req, res) => {
  res.json(CITIES);
});

app.get("/api/categories", (req, res) => {
  res.json(CATEGORIES);
});

app.get("/", (req, res) => {
  res.send("🚀 Server is running and healthy!");
});

// Error Handler مركزي
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(err.status || 500).json({ error: "حدث خطأ بالسيرفر، يرجى المحاولة لاحقاً" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});