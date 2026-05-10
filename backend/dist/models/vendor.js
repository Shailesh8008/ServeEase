"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const vendorSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "users" },
    companyName: { type: String, require: true },
});
exports.default = (0, mongoose_1.model)("vendors", vendorSchema);
