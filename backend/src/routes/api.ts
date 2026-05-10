/// <reference path="../types/express.d.ts" />
import express from "express";
import authRouter from "./auth";
import VendorRoutes from "./vendor.routes";
import servicesController from "../controller/services";
import { authMiddleware, customerAuth, vendorAuth } from "../middlewares/auth";
const apiRouter = express.Router();

apiRouter.use("/auth", authRouter);
apiRouter.get("/services", servicesController.getServices);
apiRouter.get(
  "/bookings",
  authMiddleware,
  customerAuth,
  servicesController.getBookings,
);
apiRouter.post(
  "/services/:serviceId/book",
  authMiddleware,
  customerAuth,
  servicesController.bookService,
);

apiRouter.use("/vendor", authMiddleware, vendorAuth, VendorRoutes);

export default apiRouter;
