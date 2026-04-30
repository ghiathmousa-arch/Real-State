const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
}, { timestamps: true });



UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", UserSchema);

// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZjI5MTU3OWJlNmZjMGY0NWVjYzI4YSIsImlhdCI6MTc3NzUwNDU5OSwiZXhwIjoxNzc4MTA5Mzk5fQ.Po_Hpv1PuVbH_xI9KUpE9eAIq_Em0E16yfx7qJaR6DQ
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZjI5MTU3OWJlNmZjMGY0NWVjYzI4YSIsImlhdCI6MTc3NzUwNDgxMywiZXhwIjoxNzc4MTA5NjEzfQ.YebXXYwR-1E-jjv4p3PyEvKqaAvc6_FNnjLaHyqYz7U