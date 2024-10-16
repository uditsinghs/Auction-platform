import mongoose from "mongoose";

export const connectDB = async () => {
  const URL = process.env.MONGO_URI;
  try {
    await mongoose.connect(URL, {
      useNewUrlParser: true,
    });
    console.log("Database connected successfully");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
