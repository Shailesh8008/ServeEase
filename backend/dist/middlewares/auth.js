"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerAuth = exports.vendorAuth = exports.adminAuth = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
        return res
            .status(401)
            .json({ ok: false, message: "Access Denied: No token provided" });
    }
    try {
        const verify = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET_KEY);
        req.user = verify;
    }
    catch (error) {
        return res
            .status(401)
            .json({ ok: false, message: "Token is invalid or expired" });
    }
    next();
};
exports.authMiddleware = authMiddleware;
const adminAuth = (req, res, next) => {
    const { role } = req.user;
    if (role === "ADMIN")
        return next();
    return res
        .status(403)
        .json({ ok: false, message: "Only Admin can access this page" });
};
exports.adminAuth = adminAuth;
const vendorAuth = (req, res, next) => {
    const { role } = req.user;
    if (role === "VENDOR")
        return next();
    return res
        .status(403)
        .json({ ok: false, message: "Only Vendor can access this page" });
};
exports.vendorAuth = vendorAuth;
const customerAuth = (req, res, next) => {
    const { role } = req.user;
    if (role === "CUSTOMER")
        return next();
    return res
        .status(403)
        .json({ ok: false, message: "Only Customer can access this page" });
};
exports.customerAuth = customerAuth;
