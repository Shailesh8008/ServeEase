import { Schema, model } from "mongoose";

const userSchema = new Schema({
  fullName: { type: String },
  email: { type: String, require: true, unique: true },
  role: {
    type: String,
    enum: ["customer", "admin", "vendor"],
    default: "customer",
  },
});

const userModel = model("users", userSchema);
export default userModel;
