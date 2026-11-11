const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  // admin = كل الصلاحيات · editor = سب أدمن (بيضيف فوراً، تعديله بموافقة الأدمن، ما بيحذف) · user = بلا صلاحيات داشبورد
  role: { type: String, enum: ["admin", "editor", "user"], default: "user" },
}, { timestamps: true });



UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", UserSchema);

