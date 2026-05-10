import express from "express";
import vendorController from "../controller/vendor";
import { uploads } from "../middlewares/multer";
const router = express.Router();

router.get("/dashboard", vendorController.getDashboard);
router.get("/services", vendorController.getServices);
router.post("/services", uploads.single("poster"), vendorController.createService);
router.post(
  "/create-service",
  uploads.single("poster"),
  vendorController.createService,
);
router.put(
  "/services/:serviceId",
  uploads.single("poster"),
  vendorController.updateService,
);
router.delete("/services/:serviceId", vendorController.deleteService);
router.get("/orders", vendorController.getOrders);
router.patch("/orders/:orderId/status", vendorController.updateOrderStatus);

export default router;
