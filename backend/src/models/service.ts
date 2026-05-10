import { Schema, model } from "mongoose";
import vendor from "./vendor";

const serviceSchema = new Schema({
  vendorId: { type: Schema.Types.ObjectId, ref: "vendors" },
  sname: { type: String, require: true },
  marginPrice: { type: Number, require: true },
  sellingPrice: { type: Number, require: true },
  category: { type: String, require: true },
  city: { type: String, require: true },
  description: { type: String },
  poster: { type: String },
});

export default model("services", serviceSchema);
