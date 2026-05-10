/// <reference path="../types/express.d.ts" />
import express from "express";
import authRouter from "./auth";
import VendorRoutes from "./vendor.routes";
import servicesController from "../controller/services";
import { authMiddleware, vendorAuth } from "../middlewares/auth";
const apiRouter = express.Router();

apiRouter.use("/auth", authRouter);
apiRouter.get("/services", servicesController.getServices);

apiRouter.use("/vendor", authMiddleware, vendorAuth, VendorRoutes);

export default apiRouter;
