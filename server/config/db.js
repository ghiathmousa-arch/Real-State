const mongoose = require("mongoose"); // استيراد مكتبة mongoose للتواصل مع MongoDB

const connectDB = async () => {
  mongoose.connect(process.env.MONGO_URI); // الاتصال بـ MongoDB باستخدام الرابط من ملف .env

  mongoose.connection.on("connected", () =>
    console.log("🔥 MongoDB Connected Successfully") // رسالة نجاح عند الاتصال
  );

  mongoose.connection.on("error", (err) =>
    console.log("❌ MongoDB Error:", err) // رسالة خطأ إذا فشل الاتصال
  );
};

module.exports = connectDB; // تصدير الدالة لاستخدامها في index.js