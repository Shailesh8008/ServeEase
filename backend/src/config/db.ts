import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.DB) {
      throw new Error("DB environment variable is not defined");
    }
    await mongoose.connect(process.env.DB);
    console.log("DB connected successfully!");
  } catch (error) {
    console.log(error);
    console.log("Failed to connect to DB!");
    process.exit(1);
  }
};

export default connectDB;
