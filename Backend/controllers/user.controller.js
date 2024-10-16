import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
import { generateToken } from "../utils/generateToken.js";

export const register = async (req, res, next) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return next(new ErrorHandler("Profile image is required", 400));
    }

    console.log(req.files);

    const { profileImage } = req.files;
    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedFormats.includes(profileImage.mimetype)) {
      return next(new ErrorHandler("File format is not supported", 400));
    }

    const {
      userName,
      email,
      password,
      address,
      phone,
      bankAccountNumber,
      bankAccountName,
      bankName,
      paypalEmail,
      phonepeNumber,
      role,
    } = req.body;

    if (!userName || !email || !password || !phone || !address) {
      return next(new ErrorHandler("Please provide all details", 400));
    }

    if (role === "Auctioneer") {
      if (!bankAccountName || !bankAccountNumber || !bankName) {
        return next(new ErrorHandler("Please provide all bank details", 400));
      }
    }
    if (!phonepeNumber) {
      return next(new ErrorHandler("Please provide PhonePe number", 400));
    }
    if (!paypalEmail) {
      return next(new ErrorHandler("Please provide PayPal email", 400));
    }

    const isRegistered = await User.findOne({ email });
    if (isRegistered) {
      return next(new ErrorHandler("User already exists", 400));
    }

    const cloudinaryResponse = await cloudinary.uploader.upload(
      profileImage.tempFilePath,
      {
        folder: "Auction_Profile_Images",
      }
    );
    if (!cloudinaryResponse || cloudinaryResponse.error) {
      console.log(
        "Cloudinary Error:",
        cloudinaryResponse.error || "Unknown Cloudinary error"
      );

      return next(
        new ErrorHandler("Failed to upload profile image to Cloudinary", 400)
      );
    }

    const user = await User.create({
      userName,
      email,
      password,
      address,
      phone,
      role,
      profileImage: {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
      },
      paymentMethods: {
        bankTransfer: {
          bankAccountNumber,
          bankAccountName,
          bankName,
        },
        paypal: {
          paypalEmail,
        },
        phonepe: {
          phonepeNumber,
        },
      },
    });

    generateToken(user, "User created successfully", 201, res);
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal server error", 500));
  }
};
