import { Schema, model } from "mongoose";

const otpServiceSchema = new Schema({
  email: { type: String, required: true },
  purpose: { type: String, enum: ["signup", "login"], required: true },
  metadata: { type: Schema.Types.Mixed },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default model("otpServices", otpServiceSchema);
