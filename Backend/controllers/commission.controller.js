import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/user.model.js";
import { PaymentProof } from "../models/commisionProof.js";
import { v2 as cloudinary } from "cloudinary";
export const proofOfCommision = async (req, resizeBy, next) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return next(new ErrorHandler("Payment Proof Screenshot required.", 400));
    }
    const { proof } = req.files;
    const { amount, comment } = req.body;
    const user = await User.findById(req.user?._id);
    if (!amount || !comment) {
      return next(new ErrorHandler("Fill the all details .", 400));
    }
    if (user.unpaidCommission === 0) {
      return res.status(200).json({
        message: "You don't have any unpaid commision",
        success: true,
      });
    }

    if (user.unpaidCommission < amount) {
      return next(
        new ErrorHandler(
          `The amount exceeds your unpaid commision balance. Please enter an amount  up to ${user.unpaidCommission}`,
          403
        )
      );
    }

    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedFormats.includes(proof.mimetype)) {
      return next(new ErrorHandler("ScreenShot format is not supported", 400));
    }

    const cloudinaryResponse = await cloudinary.uploader.upload(
      proof.tempFilePath,
      {
        folder: "Auction_Platform_PaymentProof",
      }
    );
    if (!cloudinaryResponse || cloudinaryResponse.error) {
      console.log(
        "Cloudinary Error:",
        cloudinaryResponse.error || "Unknown Cloudinary error"
      );

      return next(
        new ErrorHandler("Failed to upload Proof Screenshot to Cloudinary", 400)
      );
    }

    const commisionProof = await PaymentProof.create({
      userId: req.user._id,
      proof: {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
      },
      amount,
      comment,
    });
    res.status(201).json({
      message:
        "Your proof has been submitted successfullt, we will review it and respond you 24 hour.",
      commisionProof,
      success:true
    });
  } catch (error) {
    console.log(error);
    next(new ErrorHandler(error.message || "Internal server error", 500));
  }
};
