import express from "express";
import vendorController from "../controller/vendor";
const router = express.Router();

router.post("/create-service", vendorController.createService);

export default router;
