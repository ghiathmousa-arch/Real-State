const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

// 1. يجب أن يكون هذا السطر في القمة تماماً قبل استدعاء أي Router
require("dotenv").config();

const connectDB = require("./config/db");

// 2. استدعاء الـ Routers بعد تحميل الإعدادات
const propertiesRouter = require("./routes/properties");
const authRouter = require("./routes/auth");
const contactRouter = require("./routes/contact");

const app = express();
const PORT = process.env.PORT || 5000;

// الاتصال بقاعدة البيانات
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/properties", propertiesRouter);
app.use("/api/auth", authRouter);
app.use("/api/contact", contactRouter);

// Healthcheck
app.get("/", (req, res) => {
  res.send("🚀 Server is running and healthy!");
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});