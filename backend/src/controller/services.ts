import { Request, Response } from "express";
import serviceModel from "../models/service";
import bookedServiceModel from "../models/bookedServices";

const bookingStatuses = [
  "Booked",
  "Confirmed",
  "Delivered",
  "Cancelled",
] as const;

const normalizeService = (service: any) => ({
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

const normalizeBooking = (booking: any) => {
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

const getServices = async (_req: Request, res: Response) => {
  try {
    const services = await serviceModel.find({}).sort({ _id: -1 });
    return res.json({
      success: true,
      services: services.map(normalizeService),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to load services",
    });
  }
};

const bookService = async (req: Request, res: Response) => {
  const customerId = req.user?.id;
  if (!customerId) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  const serviceId = String(req.params.serviceId ?? "");

  try {
    const service = await serviceModel.findById(serviceId);
    if (!service) {
      return res
        .status(404)
        .json({ success: false, error: "Service not found" });
    }

    const existingBooking = await bookedServiceModel
      .findOne({
        customerId,
        serviceId,
        status: { $in: ["Booked", "Confirmed"] },
      })
      .populate(
        "serviceId",
        "vendorId sname sellingPrice category city description poster",
      );

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        error: "You already have an active booking for this service",
        booking: normalizeBooking(existingBooking),
      });
    }

    const booking = await bookedServiceModel.create({
      customerId,
      serviceId,
    });

    const populatedBooking = await bookedServiceModel
      .findById(booking._id)
      .populate(
        "serviceId",
        "vendorId sname sellingPrice category city description poster",
      );

    return res.status(201).json({
      success: true,
      booking: normalizeBooking(populatedBooking),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to book service",
    });
  }
};

const getBookings = async (req: Request, res: Response) => {
  const customerId = req.user?.id;
  if (!customerId) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  try {
    const bookings = await bookedServiceModel
      .find({ customerId })
      .populate(
        "serviceId",
        "vendorId sname sellingPrice category city description poster",
      )
      .sort({ _id: -1 });

    return res.json({
      success: true,
      bookings: bookings.map(normalizeBooking),
      statuses: bookingStatuses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to load bookings",
    });
  }
};

const servicesController = { getServices, bookService, getBookings };

export default servicesController;
