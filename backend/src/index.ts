import dotenv from "dotenv";
dotenv.config();

import express from "express";
const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import connectDB from "./config/db";
import apiRouter from "./routes/api";
import userModel from "./models/user";

connectDB();

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/api", apiRouter);

const createDefaultAdmin = async () => {
  try {
    if (
      !process.env.ADMIN_EMAIL ||
      !process.env.ADMIN_PASS ||
      !process.env.ADMIN_NAME
    ) {
      console.warn(
        "Admin environment variables are missing. Skipping default admin creation.",
      );
      return;
    }

    const isAdminExists = await userModel.findOne({
      email: process.env.ADMIN_EMAIL,
      role: "admin",
    });

    if (isAdminExists) return;

    const adminName = process.env.ADMIN_NAME.split(" ");
    const hashedPass = await bcrypt.hash(process.env.ADMIN_PASS, 10);
    const rec = new userModel({
      fname: adminName[0] ? adminName[0] : "admin",
      lname: adminName[1] ? adminName[1] : "",
      email: process.env.ADMIN_EMAIL,
      pass: hashedPass,
      role: "admin",
    });
    await rec.save();
    console.log("Default admin created successfully.");
  } catch (error) {
    console.error("Error creating default admin:", error);
  }
};
createDefaultAdmin();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});
