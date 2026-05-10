"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const otpServiceSchema = new mongoose_1.Schema({
    email: { type: String, required: true },
    purpose: { type: String, enum: ["signup", "login"], required: true },
    metadata: { type: mongoose_1.Schema.Types.Mixed },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});
exports.default = (0, mongoose_1.model)("otpServices", otpServiceSchema);
