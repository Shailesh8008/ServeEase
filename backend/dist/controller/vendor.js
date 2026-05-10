"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = __importDefault(require("../models/service"));
const bookedServices_1 = __importDefault(require("../models/bookedServices"));
const imageKit_1 = __importDefault(require("../config/imageKit"));
const getVendorId = (req) => req.user?.id;
const normalizeService = (service) => ({
    id: service._id.toString(),
    sname: service.sname,
    marginPrice: service.marginPrice,
    sellingPrice: service.sellingPrice,
    category: service.category,
    city: service.city ?? "",
    description: service.description ?? "",
    poster: service.poster ?? "",
});
const normalizeOrder = (order) => {
    const service = order.serviceId;
    const customer = order.customerId;
    return {
        id: order._id.toString(),
        status: order.status,
        service: service
            ? {
                id: service._id.toString(),
                sname: service.sname,
                sellingPrice: service.sellingPrice,
                category: service.category,
            }
            : null,
        customer: customer
            ? {
                id: customer._id.toString(),
                fullName: customer.fullName ?? "",
                email: customer.email ?? "",
            }
            : null,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
    };
};
const getServicesForVendor = async (vendorId) => {
    const services = await service_1.default.find({ vendorId }).sort({ _id: -1 });
    return services.map(normalizeService);
};
const getOrdersForVendor = async (vendorId) => {
    const vendorServices = await service_1.default.find({ vendorId }).select("_id");
    const serviceIds = vendorServices.map((service) => service._id);
    const orders = await bookedServices_1.default
        .find({ serviceId: { $in: serviceIds } })
        .populate("serviceId", "sname sellingPrice category")
        .populate("customerId", "fullName email")
        .sort({ _id: -1 });
    return orders.map(normalizeOrder);
};
const uploadPoster = async (file) => {
    if (!file)
        return undefined;
    const uploaded = await imageKit_1.default.upload({
        file: file.buffer,
        fileName: `${Date.now()}-${file.originalname}`,
        folder: "/serviceease/services",
    });
    return uploaded.url;
};
const getDashboard = async (req, res) => {
    const vendorId = getVendorId(req);
    if (!vendorId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    try {
        const [services, orders] = await Promise.all([
            getServicesForVendor(vendorId),
            getOrdersForVendor(vendorId),
        ]);
        const pendingOrders = orders.filter((order) => order.status === "Booked");
        const confirmedOrders = orders.filter((order) => order.status === "Confirmed");
        const deliveredOrders = orders.filter((order) => order.status === "Delivered");
        const revenue = orders
            .filter((order) => order.status !== "Cancelled")
            .reduce((total, order) => total + (order.service?.sellingPrice ?? 0), 0);
        return res.json({
            success: true,
            services,
            orders,
            stats: {
                activeServices: services.length,
                pendingOrders: pendingOrders.length,
                confirmedOrders: confirmedOrders.length,
                completedOrders: deliveredOrders.length,
                revenue,
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to load dashboard",
        });
    }
};
const getServices = async (req, res) => {
    const vendorId = getVendorId(req);
    if (!vendorId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    try {
        const services = await getServicesForVendor(vendorId);
        return res.json({ success: true, services });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to load services",
        });
    }
};
const createService = async (req, res) => {
    const vendorId = getVendorId(req);
    if (!vendorId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    const { sname, marginPrice, sellingPrice, category, city, description, poster } = req.body;
    if (!sname || !marginPrice || !sellingPrice || !category || !city) {
        return res.status(400).json({
            success: false,
            error: "Service name, prices, category, and city are required",
        });
    }
    try {
        const posterUrl = (await uploadPoster(req.file)) ?? poster;
        const service = await service_1.default.create({
            vendorId,
            sname,
            marginPrice: Number(marginPrice),
            sellingPrice: Number(sellingPrice),
            category,
            city,
            description,
            poster: posterUrl,
        });
        return res.status(201).json({
            success: true,
            service: normalizeService(service),
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to create service",
        });
    }
};
const updateService = async (req, res) => {
    const vendorId = getVendorId(req);
    if (!vendorId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    const { serviceId } = req.params;
    const { sname, marginPrice, sellingPrice, category, city, description, poster } = req.body;
    if (!sname || !marginPrice || !sellingPrice || !category || !city) {
        return res.status(400).json({
            success: false,
            error: "Service name, prices, category, and city are required",
        });
    }
    try {
        const posterUrl = (await uploadPoster(req.file)) ?? poster;
        const service = await service_1.default.findOneAndUpdate({ _id: serviceId, vendorId }, {
            sname,
            marginPrice: Number(marginPrice),
            sellingPrice: Number(sellingPrice),
            category,
            city,
            description,
            poster: posterUrl,
        }, { new: true, runValidators: true });
        if (!service) {
            return res
                .status(404)
                .json({ success: false, error: "Service not found" });
        }
        return res.json({ success: true, service: normalizeService(service) });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to update service",
        });
    }
};
const deleteService = async (req, res) => {
    const vendorId = getVendorId(req);
    if (!vendorId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    const { serviceId } = req.params;
    try {
        const service = await service_1.default.findOneAndDelete({
            _id: serviceId,
            vendorId,
        });
        if (!service) {
            return res
                .status(404)
                .json({ success: false, error: "Service not found" });
        }
        return res.json({ success: true });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete service",
        });
    }
};
const getOrders = async (req, res) => {
    const vendorId = getVendorId(req);
    if (!vendorId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    try {
        const orders = await getOrdersForVendor(vendorId);
        return res.json({ success: true, orders });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to load orders",
        });
    }
};
const updateOrderStatus = async (req, res) => {
    const vendorId = getVendorId(req);
    if (!vendorId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    const { orderId } = req.params;
    const { status } = req.body;
    const allowedStatuses = ["Confirmed", "Cancelled"];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            error: "Order can only be confirmed or cancelled from this page",
        });
    }
    try {
        const order = await bookedServices_1.default.findById(orderId).populate({
            path: "serviceId",
            select: "vendorId",
        });
        const service = order?.serviceId;
        if (!order || service?.vendorId?.toString() !== vendorId) {
            return res.status(404).json({ success: false, error: "Order not found" });
        }
        order.status = status;
        await order.save();
        const updatedOrder = await bookedServices_1.default
            .findById(orderId)
            .populate("serviceId", "sname sellingPrice category")
            .populate("customerId", "fullName email");
        return res.json({
            success: true,
            order: normalizeOrder(updatedOrder),
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to update order status",
        });
    }
};
const vendorController = {
    getDashboard,
    getServices,
    createService,
    updateService,
    deleteService,
    getOrders,
    updateOrderStatus,
};
exports.default = vendorController;
