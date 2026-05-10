"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = __importDefault(require("../models/service"));
const bookedServices_1 = __importDefault(require("../models/bookedServices"));
const bookingStatuses = [
    "Booked",
    "Confirmed",
    "Delivered",
    "Cancelled",
];
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
const normalizeBooking = (booking) => {
    const service = booking.serviceId;
    return {
        id: booking._id.toString(),
        status: booking.status,
        service: service
            ? {
                id: service._id.toString(),
                vendorId: service.vendorId?.toString?.() ?? "",
                sname: service.sname,
                sellingPrice: service.sellingPrice,
                category: service.category,
                city: service.city ?? "",
                description: service.description ?? "",
                poster: service.poster ?? "",
            }
            : null,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
    };
};
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
const bookService = async (req, res) => {
    const customerId = req.user?.id;
    if (!customerId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    const serviceId = String(req.params.serviceId ?? "");
    try {
        const service = await service_1.default.findById(serviceId);
        if (!service) {
            return res
                .status(404)
                .json({ success: false, error: "Service not found" });
        }
        const existingBooking = await bookedServices_1.default
            .findOne({
            customerId,
            serviceId,
            status: { $in: ["Booked", "Confirmed"] },
        })
            .populate("serviceId", "vendorId sname sellingPrice category city description poster");
        if (existingBooking) {
            return res.status(409).json({
                success: false,
                error: "You already have an active booking for this service",
                booking: normalizeBooking(existingBooking),
            });
        }
        const booking = await bookedServices_1.default.create({
            customerId,
            serviceId,
        });
        const populatedBooking = await bookedServices_1.default
            .findById(booking._id)
            .populate("serviceId", "vendorId sname sellingPrice category city description poster");
        return res.status(201).json({
            success: true,
            booking: normalizeBooking(populatedBooking),
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to book service",
        });
    }
};
const getBookings = async (req, res) => {
    const customerId = req.user?.id;
    if (!customerId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    try {
        const bookings = await bookedServices_1.default
            .find({ customerId })
            .populate("serviceId", "vendorId sname sellingPrice category city description poster")
            .sort({ _id: -1 });
        return res.json({
            success: true,
            bookings: bookings.map(normalizeBooking),
            statuses: bookingStatuses,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to load bookings",
        });
    }
};
const servicesController = { getServices, bookService, getBookings };
exports.default = servicesController;
