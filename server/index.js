const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

require("dotenv").config({ path: __dirname + "/.env" });

const connectDB = require("./config/db");
const propertiesRouter = require("./routes/properties");

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/properties", propertiesRouter);

app.get("/api/categories", (req, res) => {
  res.json(["شقة", "منزل", "أرض", "مكتب", "متجر", "مستودع"]);
});

app.get("/api/cities", (req, res) => {
  res.json(["دمشق", "حلب", "حمص", "حماة", "اللاذقية", "طرطوس", "دير الزور", "الحسكة"]);
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));