/// <reference path="../types/express.d.ts" />
import express from "express";
import authRouter from "./auth";
import VendorRoutes from "./vendor.routes";
import { authMiddleware, vendorAuth } from "../middlewares/auth";
const apiRouter = express.Router();

apiRouter.use("/auth", authRouter);

apiRouter.use("/vendor", authMiddleware, vendorAuth, VendorRoutes);

export default apiRouter;
