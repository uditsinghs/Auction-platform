import mongoose, { mongo } from "mongoose";
import { Auction } from "../models/auction.model.js";
import ErrorHandler from "./error.js";
export const checkAuctionEndTime = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorHandler("Id format is not valid", 400));
    }
    const auction = await Auction.findById(id);
    if (!auction) {
      return next(new ErrorHandler("Auction not found.", 404));
    }

    const now = new Date();
    if (new Date(auction.startTime) > now) {
      return next(new ErrorHandler("Auction has not started yet.", 400));
    }
    if (new Date(auction.endTime) < now) {
      return next(new ErrorHandler("Auction is ended.", 400));
    }
    next();
  } catch (error) {
    console.log(error);
    next(new ErrorHandler("Internal serevr error.", 500));
  }
};
