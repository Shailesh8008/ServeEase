"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = __importDefault(require("./config/db"));
const api_1 = __importDefault(require("./routes/api"));
const user_1 = __importDefault(require("./models/user"));
(0, db_1.default)();
app.use((0, cors_1.default)({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use("/api", api_1.default);
const createDefaultAdmin = async () => {
    try {
        if (!process.env.ADMIN_EMAIL ||
            !process.env.ADMIN_PASS ||
            !process.env.ADMIN_NAME) {
            console.warn("Admin environment variables are missing. Skipping default admin creation.");
            return;
        }
        const isAdminExists = await user_1.default.findOne({
            email: process.env.ADMIN_EMAIL,
            role: "admin",
        });
        if (isAdminExists)
            return;
        const adminName = process.env.ADMIN_NAME.split(" ");
        const hashedPass = await bcrypt_1.default.hash(process.env.ADMIN_PASS, 10);
        const rec = new user_1.default({
            fname: adminName[0] ? adminName[0] : "admin",
            lname: adminName[1] ? adminName[1] : "",
            email: process.env.ADMIN_EMAIL,
            pass: hashedPass,
            role: "admin",
        });
        await rec.save();
        console.log("Default admin created successfully.");
    }
    catch (error) {
        console.error("Error creating default admin:", error);
    }
};
createDefaultAdmin();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`);
});
