"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const vendor_1 = __importDefault(require("../controller/vendor"));
const multer_1 = require("../middlewares/multer");
const router = express_1.default.Router();
router.get("/dashboard", vendor_1.default.getDashboard);
router.get("/services", vendor_1.default.getServices);
router.post("/services", multer_1.uploads.single("poster"), vendor_1.default.createService);
router.post("/create-service", multer_1.uploads.single("poster"), vendor_1.default.createService);
router.put("/services/:serviceId", multer_1.uploads.single("poster"), vendor_1.default.updateService);
router.delete("/services/:serviceId", vendor_1.default.deleteService);
router.get("/orders", vendor_1.default.getOrders);
router.patch("/orders/:orderId/status", vendor_1.default.updateOrderStatus);
exports.default = router;
