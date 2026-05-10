import { Schema, model } from "mongoose";

const vendorSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "users" },
  companyName: { type: String, require: true },
});

export default model("vendors", vendorSchema);
