import express, { urlencoded } from "express";
import dotenv from "dotenv";
import cloudinary from "cloudinary";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { connectDB } from "./utils/db.js";

const app = express();
dotenv.config();

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const PORT = process.env.PORT || 5000;
connectDB();
app.listen(PORT, () => {
  console.log(`The Port is listen on ${PORT} port `);
});
