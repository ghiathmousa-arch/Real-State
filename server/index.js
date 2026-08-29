const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
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

// Render يستقبل الطلبات عبر بروكسي داخلي (TLS ينتهي عنده) — بدون هاد السطر
// req.secure بيضل false دائماً فبتنكسر كوكي الجلسة (secure+SameSite=None) وrate limiting
app.set("trust proxy", 1);

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
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true // لازم عشان كوكي الجلسة (httpOnly) ينبعث ويُقبل عبر النطاقات
}));

app.use("/api/", apiLimiter);

app.use(cookieParser());

// ── الـ Body Parsing ──────────────────────────────────────
// مع حد أقصى لحجم الجسم لمنع إساءة استخدام نماذج الإدخال العامة (تواصل، تسجيل دخول)
// mongoSanitize لازم يجي بعد الـ body parsers، لأنه بيفحص req.body وقت التسجيل
// وإلا بيكون لسا مش موجود فبيصير no-op على كل بيانات POST/PUT
app.use(bodyParser.json({ limit: "10kb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10kb" }));

app.use(mongoSanitize());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── الراوتات ──────────────────────────────────────────────
app.use("/api/properties", propertiesRouter);
app.use("/api/auth", authRouter);
app.use("/api/contact", contactRouter);

// بيانات ثابتة بالكود (server/constants/property.js) — ما بتتغيّر إلا بـ deploy جديد،
// فكاش يوم كامل آمن 100% وبيوفر أكتر endpoint مضروب بالموقع
app.get("/api/cities", (req, res) => {
  res.set("Cache-Control", "public, max-age=86400");
  res.json(CITIES);
});

app.get("/api/categories", (req, res) => {
  res.set("Cache-Control", "public, max-age=86400");
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