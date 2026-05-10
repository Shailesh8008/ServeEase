"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    fullName: { type: String },
    email: { type: String, require: true, unique: true },
    role: {
        type: String,
        enum: ["customer", "admin", "vendor"],
        default: "customer",
    },
});
const userModel = (0, mongoose_1.model)("users", userSchema);
exports.default = userModel;
