import { Schema, model } from "mongoose";

const bookedServiceSchema = new Schema({
  customerId: { type: Schema.Types.ObjectId, ref: "users" },
  serviceId: { type: Schema.Types.ObjectId, ref: "services" },
  status: {
    type: String,
    enum: ["Booked", "Confirmed", "Delivered", "Cancelled"],
    default: "Booked",
  },
});

export default model("bookedServices", bookedServiceSchema);
