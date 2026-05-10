/// <reference path="../types/express.d.ts" />
import { Request, Response } from "express";
import serviceModel from "../models/service";
import bookedServiceModel from "../models/bookedServices";
import imageKit from "../config/imageKit";

const getVendorId = (req: Request) => req.user?.id;

const normalizeService = (service: any) => ({
  id: service._id.toString(),
  sname: service.sname,
  marginPrice: service.marginPrice,
  sellingPrice: service.sellingPrice,
  category: service.category,
  city: service.city ?? "",
  description: service.description ?? "",
  poster: service.poster ?? "",
});

const normalizeOrder = (order: any) => {
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

const getServicesForVendor = async (vendorId: string) => {
  const services = await serviceModel.find({ vendorId }).sort({ _id: -1 });
  return services.map(normalizeService);
};

const getOrdersForVendor = async (vendorId: string) => {
  const vendorServices = await serviceModel.find({ vendorId }).select("_id");
  const serviceIds = vendorServices.map((service) => service._id);

  const orders = await bookedServiceModel
    .find({ serviceId: { $in: serviceIds } })
    .populate("serviceId", "sname sellingPrice category")
    .populate("customerId", "fullName email")
    .sort({ _id: -1 });

  return orders.map(normalizeOrder);
};

const uploadPoster = async (file?: Express.Multer.File) => {
  if (!file) return undefined;

  const uploaded = await imageKit.upload({
    file: file.buffer,
    fileName: `${Date.now()}-${file.originalname}`,
    folder: "/serviceease/services",
  });

  return uploaded.url;
};

const getDashboard = async (req: Request, res: Response) => {
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
    const confirmedOrders = orders.filter(
      (order) => order.status === "Confirmed",
    );
    const deliveredOrders = orders.filter(
      (order) => order.status === "Delivered",
    );
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
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to load dashboard",
    });
  }
};

const getServices = async (req: Request, res: Response) => {
  const vendorId = getVendorId(req);
  if (!vendorId) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  try {
    const services = await getServicesForVendor(vendorId);
    return res.json({ success: true, services });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to load services",
    });
  }
};

const createService = async (req: Request, res: Response) => {
  const vendorId = getVendorId(req);
  if (!vendorId) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  const { sname, marginPrice, sellingPrice, category, city, description, poster } =
    req.body;

  if (!sname || !marginPrice || !sellingPrice || !category || !city) {
    return res.status(400).json({
      success: false,
      error: "Service name, prices, category, and city are required",
    });
  }

  try {
    const posterUrl = (await uploadPoster(req.file)) ?? poster;
    const service = await serviceModel.create({
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
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to create service",
    });
  }
};

const updateService = async (req: Request, res: Response) => {
  const vendorId = getVendorId(req);
  if (!vendorId) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  const { serviceId } = req.params;
  const { sname, marginPrice, sellingPrice, category, city, description, poster } =
    req.body;

  if (!sname || !marginPrice || !sellingPrice || !category || !city) {
    return res.status(400).json({
      success: false,
      error: "Service name, prices, category, and city are required",
    });
  }

  try {
    const posterUrl = (await uploadPoster(req.file)) ?? poster;
    const service = await serviceModel.findOneAndUpdate(
      { _id: serviceId, vendorId },
      {
        sname,
        marginPrice: Number(marginPrice),
        sellingPrice: Number(sellingPrice),
        category,
        city,
        description,
        poster: posterUrl,
      },
      { new: true, runValidators: true },
    );

    if (!service) {
      return res
        .status(404)
        .json({ success: false, error: "Service not found" });
    }

    return res.json({ success: true, service: normalizeService(service) });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to update service",
    });
  }
};

const deleteService = async (req: Request, res: Response) => {
  const vendorId = getVendorId(req);
  if (!vendorId) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  const { serviceId } = req.params;

  try {
    const service = await serviceModel.findOneAndDelete({
      _id: serviceId,
      vendorId,
    });

    if (!service) {
      return res
        .status(404)
        .json({ success: false, error: "Service not found" });
    }

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete service",
    });
  }
};

const getOrders = async (req: Request, res: Response) => {
  const vendorId = getVendorId(req);
  if (!vendorId) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  try {
    const orders = await getOrdersForVendor(vendorId);
    return res.json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to load orders",
    });
  }
};

const updateOrderStatus = async (req: Request, res: Response) => {
  const vendorId = getVendorId(req);
  if (!vendorId) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  const { orderId } = req.params;
  const { status } = req.body;
  const allowedStatuses = ["Confirmed", "Delivered", "Cancelled"];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error:
        "Order can only be confirmed, delivered, or cancelled from this page",
    });
  }

  try {
    const order = await bookedServiceModel.findById(orderId).populate({
      path: "serviceId",
      select: "vendorId",
    });

    const service = order?.serviceId as any;
    if (!order || service?.vendorId?.toString() !== vendorId) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        error: "Cancelled orders cannot be updated",
      });
    }

    order.status = status;
    await order.save();

    const updatedOrder = await bookedServiceModel
      .findById(orderId)
      .populate("serviceId", "sname sellingPrice category")
      .populate("customerId", "fullName email");

    return res.json({
      success: true,
      order: normalizeOrder(updatedOrder),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update order status",
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

export default vendorController;
