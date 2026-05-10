"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const user_1 = __importDefault(require("../models/user"));
const otpService_1 = __importDefault(require("../models/otpService"));
const authRouter = express_1.default.Router();
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:3000";
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const OTP_EXPIRES_MINUTES = 15;
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
if (!JWT_SECRET_KEY) {
    throw new Error("JWT_SECRET_KEY must be defined in environment variables");
}
const createTransporter = () => {
    return nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: process.env.ADMIN_EMAIL,
            pass: process.env.SMTP_PASS,
        },
    });
};
const sendMail = async (to, subject, body) => {
    const transporter = createTransporter();
    await transporter.sendMail({
        from: `"ServiceEase" <${process.env.ADMIN_EMAIL}>`,
        to,
        subject,
        text: body,
        html: `<p>${body}</p>`,
    });
};
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
const mapToDbRole = (accountType) => {
    const normalized = accountType?.toLowerCase();
    if (normalized === "vendor")
        return "vendor";
    if (normalized === "admin")
        return "admin";
    return "customer";
};
const mapToJwtRole = (role) => {
    const normalized = role?.toLowerCase();
    if (normalized === "vendor")
        return "VENDOR";
    if (normalized === "admin")
        return "ADMIN";
    return "CUSTOMER";
};
const createToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET_KEY, { expiresIn: "7d" });
};
const setAuthCookie = (res, token) => {
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: COOKIE_MAX_AGE,
    });
};
const clearOtpByEmail = async (email) => {
    await otpService_1.default.deleteMany({ email });
};
const createOtpRecord = async (email, purpose, metadata) => {
    await otpService_1.default.deleteMany({ email });
    const code = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);
    await otpService_1.default.create({
        email,
        purpose,
        metadata,
        code,
        expiresAt,
        verified: false,
    });
    return code;
};
const getValidOtpRecord = async (email, code) => {
    return otpService_1.default.findOne({
        email,
        code,
        expiresAt: { $gte: new Date() },
        verified: false,
    });
};
const buildUserMetadata = (accountType, fullName, phone, businessName, serviceCategory, serviceCity) => {
    return {
        action: "signup",
        account_type: accountType,
        full_name: fullName ?? "",
        phone: phone ?? "",
        business_name: businessName ?? "",
        service_category: serviceCategory ?? "",
        service_city: serviceCity ?? "",
    };
};
const createUserFromMetadata = async (email, metadata) => {
    const accountType = typeof metadata.account_type === "string"
        ? metadata.account_type
        : "customer";
    const fullName = typeof metadata.full_name === "string" ? metadata.full_name : "";
    return user_1.default.create({
        email,
        fullName,
        role: mapToDbRole(accountType),
    });
};
const authRouterHandler = async (req, res) => {
    const { accountType } = req.params;
    if (accountType !== "customer" && accountType !== "vendor") {
        return res.status(404).json({ success: false, error: "Unknown auth type" });
    }
    const { action, email, otpCode, fullName, phone, businessName, serviceCategory, serviceCity, } = req.body;
    if (!action) {
        return res.status(400).json({ success: false, error: "Missing action" });
    }
    if (!email) {
        return res.status(400).json({ success: false, error: "Email is required" });
    }
    try {
        if (action === "signup") {
            const existingUser = await user_1.default.findOne({ email });
            if (existingUser) {
                return res
                    .status(400)
                    .json({ success: false, error: "Email is already registered" });
            }
            const code = await createOtpRecord(email, "signup", buildUserMetadata(accountType, fullName, phone, businessName, serviceCategory, serviceCity));
            await sendMail(email, "Your ServiceEase signup OTP", `Your signup OTP is ${code}. It expires in ${OTP_EXPIRES_MINUTES} minutes.`);
            return res
                .status(200)
                .json({ success: true, message: "Signup OTP sent" });
        }
        if (action === "login") {
            const existingUser = await user_1.default.findOne({ email });
            if (!existingUser) {
                return res
                    .status(404)
                    .json({ success: false, error: "No account found for this email" });
            }
            const code = await createOtpRecord(email, "login");
            await sendMail(email, "Your ServiceEase login OTP", `Your login OTP is ${code}. It expires in ${OTP_EXPIRES_MINUTES} minutes.`);
            return res.status(200).json({ success: true, message: "Login OTP sent" });
        }
        if (action === "verify") {
            if (!otpCode) {
                return res
                    .status(400)
                    .json({ success: false, error: "OTP code is required" });
            }
            const otpRecord = await getValidOtpRecord(email, otpCode);
            if (!otpRecord) {
                return res
                    .status(400)
                    .json({ success: false, error: "Invalid or expired OTP" });
            }
            let user = await user_1.default.findOne({ email });
            if (!user && otpRecord.purpose === "signup") {
                const metadata = otpRecord.metadata ?? {};
                user = await createUserFromMetadata(email, metadata);
            }
            if (!user) {
                return res
                    .status(404)
                    .json({ success: false, error: "No account found for this email" });
            }
            await clearOtpByEmail(email);
            const tokenRole = mapToJwtRole(user.role);
            const userFullName = user.fullName ?? undefined;
            const token = createToken({
                id: user.id,
                email: user.email ?? email,
                role: tokenRole,
                fullName: userFullName,
                name: userFullName,
            });
            setAuthCookie(res, token);
            return res.status(200).json({
                success: true,
                message: "OTP verified",
                user: {
                    id: user.id,
                    email: user.email ?? email,
                    role: user.role,
                    name: user.fullName,
                },
            });
        }
        return res.status(400).json({ success: false, error: "Unknown action" });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
};
authRouter.post("/:accountType", authRouterHandler);
exports.default = authRouter;
