/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { MyJwtPayload } from "../types/interfaces";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies?.token;
  if (!token) {
    return res
      .status(401)
      .json({ ok: false, message: "Access Denied: No token provided" });
  }

  try {
    const verify = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY as string,
    ) as MyJwtPayload;
    req.user = verify;
  } catch (error) {
    return res
      .status(401)
      .json({ ok: false, message: "Token is invalid or expired" });
  }

  next();
};

export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  const { role } = req.user!;
  if (role === "ADMIN") return next();
  return res
    .status(403)
    .json({ ok: false, message: "Only Admin can access this page" });
};

export const vendorAuth = (req: Request, res: Response, next: NextFunction) => {
  const { role } = req.user!;
  if (role === "VENDOR") return next();
  return res
    .status(403)
    .json({ ok: false, message: "Only Vendor can access this page" });
};
