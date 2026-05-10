"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const serviceSchema = new mongoose_1.Schema({
    vendorId: { type: mongoose_1.Schema.Types.ObjectId, ref: "vendors" },
    sname: { type: String, require: true },
    marginPrice: { type: Number, require: true },
    sellingPrice: { type: Number, require: true },
    category: { type: String, require: true },
    city: { type: String, require: true },
    description: { type: String },
    poster: { type: String },
});
exports.default = (0, mongoose_1.model)("services", serviceSchema);
