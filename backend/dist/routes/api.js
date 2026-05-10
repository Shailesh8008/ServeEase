"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../types/express.d.ts" />
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("./auth"));
const vendor_routes_1 = __importDefault(require("./vendor.routes"));
const services_1 = __importDefault(require("../controller/services"));
const auth_2 = require("../middlewares/auth");
const apiRouter = express_1.default.Router();
apiRouter.use("/auth", auth_1.default);
apiRouter.get("/services", services_1.default.getServices);
apiRouter.get("/bookings", auth_2.authMiddleware, auth_2.customerAuth, services_1.default.getBookings);
apiRouter.post("/services/:serviceId/book", auth_2.authMiddleware, auth_2.customerAuth, services_1.default.bookService);
apiRouter.use("/vendor", auth_2.authMiddleware, auth_2.vendorAuth, vendor_routes_1.default);
exports.default = apiRouter;
