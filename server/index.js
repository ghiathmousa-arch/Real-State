const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config({ path: __dirname + "/.env" });

const connectDB = require("./config/db");
const propertiesRouter = require("./routes/properties");
const authRouter = require("./routes/auth");
const contactRouter = require("./routes/contact"); // استيراد فورم التواصل

const app = express();
const PORT = process.env.PORT || 5000;

// الاتصال بقاعدة البيانات
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/properties", propertiesRouter);
app.use("/api/auth", authRouter);
app.use("/api/contact", contactRouter); // تفعيل فورم التواصل

// Helpers (Categories & Cities)
app.get("/api/categories", (req, res) => {
  res.json(["شقة", "منزل", "أرض", "مكتب", "متجر", "مستودع"]);
});

app.get("/api/cities", (req, res) => {
  res.json(["دمشق", "حلب", "حمص", "حماة", "اللاذقية", "طرطوس", "دير الزور", "الحسكة"]);
});

// تشغيل السيرفر
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));