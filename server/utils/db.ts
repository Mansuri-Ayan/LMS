/** @format */

import mongoose from "mongoose";

const MONGO_URL: string = process.env.MONGO_URL || "";

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URL).then((data: any) => {
      console.log(`Database connected with ${data.connection.host}`);
    });
  } catch (error: any) {
    console.log(error.message);
    setTimeout(connectDB, 5000);
  }
};
