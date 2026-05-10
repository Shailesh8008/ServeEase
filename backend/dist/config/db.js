"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        if (!process.env.DB) {
            throw new Error("DB environment variable is not defined");
        }
        await mongoose_1.default.connect(process.env.DB);
        console.log("DB connected successfully!");
    }
    catch (error) {
        console.log(error);
        console.log("Failed to connect to DB!");
        process.exit(1);
    }
};
exports.default = connectDB;
