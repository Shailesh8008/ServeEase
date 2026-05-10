import { Request, Response } from "express";
const createService = async (req: Request, res: Response) => {
  return res.json({ ok: "true" });
};

const vendorController = { createService };

export default vendorController;
