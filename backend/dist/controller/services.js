"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = __importDefault(require("../models/service"));
const normalizeService = (service) => ({
    id: service._id.toString(),
    vendorId: service.vendorId?.toString?.() ?? "",
    sname: service.sname,
    marginPrice: service.marginPrice,
    sellingPrice: service.sellingPrice,
    category: service.category,
    city: service.city ?? "",
    description: service.description ?? "",
    poster: service.poster ?? "",
});
const getServices = async (_req, res) => {
    try {
        const services = await service_1.default.find({}).sort({ _id: -1 });
        return res.json({
            success: true,
            services: services.map(normalizeService),
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to load services",
        });
    }
};
const servicesController = { getServices };
exports.default = servicesController;
