import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import userModel from "../models/user";
import otpServiceModel from "../models/otpService";

const authRouter = express.Router();

type DbRole = "customer" | "vendor" | "admin";
type RoleType = "CUSTOMER" | "VENDOR" | "ADMIN";

const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:3000";
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const OTP_EXPIRES_MINUTES = 15;
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

if (!JWT_SECRET_KEY) {
  throw new Error("JWT_SECRET_KEY must be defined in environment variables");
}

interface AuthRequestBody {
  action: "signup" | "login" | "verify";
  email?: string;
  password?: string;
  otpCode?: string;
  fullName?: string;
  phone?: string;
  businessName?: string;
  serviceCategory?: string;
  serviceCity?: string;
}

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendMail = async (to: string, subject: string, body: string) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"ServiceEase" <${process.env.ADMIN_EMAIL}>`,
    to,
    subject,
    text: body,
    html: `<p>${body}</p>`,
  });
};

const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const mapToDbRole = (accountType: string): DbRole => {
  const normalized = accountType?.toLowerCase();
  if (normalized === "vendor") return "vendor";
  if (normalized === "admin") return "admin";
  return "customer";
};

const mapToJwtRole = (role: string): RoleType => {
  const normalized = role?.toLowerCase();
  if (normalized === "vendor") return "VENDOR";
  if (normalized === "admin") return "ADMIN";
  return "CUSTOMER";
};

const createToken = (payload: {
  id: string;
  email: string;
  role: RoleType;
  fullName?: string;
  name?: string;
}) => {
  return jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: "7d" });
};

const setAuthCookie = (res: Response, token: string) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.ENV === "production",
    sameSite: "strict",
    maxAge: COOKIE_MAX_AGE,
  });
};

const clearOtpByEmail = async (email: string) => {
  await otpServiceModel.deleteMany({ email });
};

const createOtpRecord = async (
  email: string,
  purpose: "signup" | "login",
  metadata?: Record<string, unknown>,
) => {
  await otpServiceModel.deleteMany({ email });

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);

  await otpServiceModel.create({
    email,
    purpose,
    metadata,
    code,
    expiresAt,
    verified: false,
  });

  return code;
};

const getValidOtpRecord = async (email: string, code: string) => {
  return otpServiceModel.findOne({
    email,
    code,
    expiresAt: { $gte: new Date() },
    verified: false,
  });
};

const buildUserMetadata = (
  accountType: "customer" | "vendor",
  fullName?: string,
  phone?: string,
  businessName?: string,
  serviceCategory?: string,
  serviceCity?: string,
) => {
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

const createUserFromMetadata = async (
  email: string,
  metadata: Record<string, unknown>,
) => {
  const accountType =
    typeof metadata.account_type === "string"
      ? metadata.account_type
      : "customer";
  const fullName =
    typeof metadata.full_name === "string" ? metadata.full_name : "";

  return userModel.create({
    email,
    fullName,
    role: mapToDbRole(accountType),
  });
};

const authRouterHandler = async (req: Request, res: Response) => {
  const { accountType } = req.params;

  if (accountType !== "customer" && accountType !== "vendor") {
    return res.status(404).json({ success: false, error: "Unknown auth type" });
  }

  const {
    action,
    email,
    otpCode,
    fullName,
    phone,
    businessName,
    serviceCategory,
    serviceCity,
  } = req.body as AuthRequestBody;

  if (!action) {
    return res.status(400).json({ success: false, error: "Missing action" });
  }

  if (!email) {
    return res.status(400).json({ success: false, error: "Email is required" });
  }

  try {
    if (action === "signup") {
      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, error: "Email is already registered" });
      }

      const code = await createOtpRecord(
        email,
        "signup",
        buildUserMetadata(
          accountType,
          fullName,
          phone,
          businessName,
          serviceCategory,
          serviceCity,
        ),
      );

      await sendMail(
        email,
        "Your ServiceEase signup OTP",
        `Your signup OTP is ${code}. It expires in ${OTP_EXPIRES_MINUTES} minutes.`,
      );

      return res
        .status(200)
        .json({ success: true, message: "Signup OTP sent" });
    }

    if (action === "login") {
      const existingUser = await userModel.findOne({ email });
      if (!existingUser) {
        return res
          .status(404)
          .json({ success: false, error: "No account found for this email" });
      }

      const code = await createOtpRecord(email, "login");
      await sendMail(
        email,
        "Your ServiceEase login OTP",
        `Your login OTP is ${code}. It expires in ${OTP_EXPIRES_MINUTES} minutes.`,
      );

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

      let user = await userModel.findOne({ email });
      if (!user && otpRecord.purpose === "signup") {
        const metadata = otpRecord.metadata ?? {};
        user = await createUserFromMetadata(
          email,
          metadata as Record<string, unknown>,
        );
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
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};

authRouter.post("/:accountType", authRouterHandler);

export default authRouter;
