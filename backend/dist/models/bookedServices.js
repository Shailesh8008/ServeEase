"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bookedServiceSchema = new mongoose_1.Schema({
    customerId: { type: mongoose_1.Schema.Types.ObjectId, ref: "users" },
    serviceId: { type: mongoose_1.Schema.Types.ObjectId, ref: "services" },
    status: {
        type: String,
        enum: ["Booked", "Confirmed", "Delivered", "Cancelled"],
        default: "Booked",
    },
});
exports.default = (0, mongoose_1.model)("bookedServices", bookedServiceSchema);
