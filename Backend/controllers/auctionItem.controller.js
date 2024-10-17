import { Auction } from "../models/auction.model.js";
import ErrorHandler from "../middlewares/error.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
// import { User } from "../models/user.model.js";

export const addNewAuctionItem = async (req, res, next) => {
  try {
    // check file path
    if (!req.files || Object.keys(req.files).length === 0) {
      return next(new ErrorHandler("auction item image is required", 400));
    }

    const { image } = req.files;
    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedFormats.includes(image.mimetype)) {
      return next(new ErrorHandler("File format is not supported", 400));
    }
    const {
      title,
      description,
      category,
      condition,
      startingBid,
      startTime,
      endTime,
    } = req.body;
    if (
      !title ||
      description ||
      !category ||
      !condition ||
      !startingBid ||
      !startTime ||
      !endTime
    ) {
      return next(new ErrorHandler("Please provide all fields", 400));
    }
    if (new Date(startTime) < Date.now()) {
      return next(
        new ErrorHandler(
          "Auction starting time must be greater than present time",
          400
        )
      );
    }
    if (new Date(startTime) >= new Date(endTime)) {
      return next(
        new ErrorHandler(
          "Auction starting time must be less than ending  time",
          400
        )
      );
    }

    const alreadyOneAuctionActive = await Auction.find({
      createdBy: req.user?._id,
      endTime: { $gt: Date.now() },
    });
    if (alreadyOneAuctionActive.length > 0) {
      return next(
        new ErrorHandler("You already have one active auction.", 400)
      );
    }

    // set image of auction on cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(
      image.tempFilePath,
      {
        folder: "Auction_Item_image",
      }
    );
    if (!cloudinaryResponse || cloudinaryResponse.error) {
      console.log(
        "Cloudinary Error:",
        cloudinaryResponse.error || "Unknown Cloudinary error"
      );

      return next(
        new ErrorHandler(
          "Failed to upload auction item image to Cloudinary",
          400
        )
      );
    }

    const auctionItem = await Auction.create({
      title,
      description,
      category,
      condition,
      startingBid,
      startTime,
      endTime,
      image: {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
      },
      createdBy: req.user._id,
    });
    return res.status(201).json({
      message: `Auction item created and listed on auction page at${startTime}`,
      success: true,
      auctionItem,
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal server error", 500));
  }
};

export const getAllItems = async (req, res, next) => {
  try {
    let items = await Auction.find();
    if (items.length <= 0) {
      return next(new ErrorHandler("No items are available.", 400));
    }
    res.status(200).json({
      success: true,
      items,
    });
  } catch (error) {
    console.log(error);
    next(new ErrorHandler("Internal server error.", 500));
  }
};
export const getAuctionDetails = async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorHandler("format of id is not valid ", 400));
  }
  const singleItem = await Auction.findById(id);
  if (!singleItem) {
    return next(new ErrorHandler("Auction not found.", 404));
  }
  const bidders = singleItem.bids.sort((a, b) => b.bid - a.bid);
  res.status(200).json({
    success: true,
    singleItem,
    bidders,
  });
  try {
  } catch (error) {
    console.log(error);
    next(new ErrorHandler("Internal server error.", 500));
  }
};
export const getMyAuctionItem = async (req, res, next) => {
  try {
    const items = await Auction.findById({ createdBy: req.user?._id });
    if (items.length <= 0) {
      return next(new ErrorHandler("No items are available.", 400));
    }
    res.status(200).json({
      success: true,
      items,
    });
  } catch (error) {
    console.log(error);
    next(new ErrorHandler("Internal server error.", 500));
  }
};
export const removeFromAuction = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorHandler("format of id is not valid ", 400));
    }
    const singleItem = await Auction.findById(id);
    if (!singleItem) {
      return next(new ErrorHandler("Auction not found.", 404));
    }
    await singleItem.deleteOne();
    res.status(200).json({
      success: true,
      message: "item deleted successfully",
    });
  } catch (error) {
    console.log(error);
    next(new ErrorHandler("Internal server error.", 500));
  }
};
export const republishItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorHandler("format of id is not valid ", 400));
    }
    let singleItem = await Auction.findById(id);
    if (!singleItem) { 
      return next(new ErrorHandler("Auction not found.", 404));
    }
    if (!req.body.startTime || !req.body.endTime) {
      new ErrorHandler("Starttime and Endtime is mandatory", 400);
    }
    if (new Date(singleItem.endTime) > Date.now()) {
      return next(
        new ErrorHandler("Auction is already active,cannot republish", 400)
      );
    }
    let data = {
      startTime: new Date(req.body.startTime),
      endTime: new Date(req.body.endTime),
    };
    if (data.startTime < Date.now()) {
      return next(
        new ErrorHandler(
          "Auction starting time must be greater than present time ",
          400
        )
      );
    }
    if (data.startTime >= data.endTime) {
      return next(
        new ErrorHandler(
          "Auction starting time must be less than end time ",
          400
        )
      );
    }

    data.bids = [];
    data.commisionCalculated = false;
    singleItem = await Auction.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
    const createdBy = await User.findByIdAndUpdate(
      req.user?._id,
      { unpaidCommission: 0 },
      {
        new: true,
        runValidators: false,
        useFindAndModify: false,
      }
    );
    createdBy.unpaidCommission = 0;
    await createdBy.save();
    res.status(200).json({
      success: true,
      auctionItem,
      message: `Auction republish and will be active on ${req.body.startTime}`,
    });
  } catch (error) {
    console.log(error);
    next(new ErrorHandler("Internal server error.", 500));
  }
};
