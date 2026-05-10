import { Request, Response } from "express";
import serviceModel from "../models/service";

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

const servicesController = { getServices };

export default servicesController;
