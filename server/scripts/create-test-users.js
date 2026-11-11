// حسابات اختبار (أدمن + سب أدمن) لقاعدة الاختبار بس.
// كلمات السر بتتولّد عشوائياً وبتنكتب بـ server/.env.test-users (متجاهَل بـ git).
//
//   $env:ENV_FILE=".env.test"; node server/scripts/create-test-users.js
//
// بيرفض يشتغل بدون ENV_FILE (يعني ما بيلمس القاعدة الحية أبداً).

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

if (!process.env.ENV_FILE) {
  console.error("❌ لازم ENV_FILE=.env.test — هالسكريبت لقاعدة الاختبار بس");
  process.exit(1);
}
require("../config/loadEnv").loadEnv(); // بيوقف إذا القاعدة مش test
const mongoose = require("mongoose");
const User = require("../models/User");

const USERS = [
  { name: "أدمن تجريبي", email: "admin@test.local", role: "admin" },
  { name: "سب أدمن تجريبي", email: "editor@test.local", role: "editor" },
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  const lines = [];
  for (const u of USERS) {
    const password = crypto.randomBytes(9).toString("base64url");
    await User.deleteOne({ email: u.email });
    await User.create({ ...u, password });
    lines.push(`${u.role.toUpperCase()}_EMAIL=${u.email}`, `${u.role.toUpperCase()}_PASSWORD=${password}`);
    console.log(`✅ ${u.role}: ${u.email}`);
  }
  fs.writeFileSync(path.join(__dirname, "..", ".env.test-users"), lines.join("\n") + "\n");
  console.log("🔑 كلمات السر انحفظت بـ server/.env.test-users");
};

run()
  .catch((err) => { console.error("❌ فشل:", err.message); process.exitCode = 1; })
  .finally(() => mongoose.disconnect());
