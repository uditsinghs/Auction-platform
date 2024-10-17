import { Bid } from "../models/bid.model.js";
import ErrorHandler from "../middlewares/error.js";
import { Auction } from "../models/auction.model.js";
import { User } from "../models/user.model.js";
export const placeBid = async (req, res, next) => {
  try {
    const { id } = req.params;
    const auctionItem = await Auction.findById(id);
    if (!auctionItem) {
      return next(new ErrorHandler("Auction item not found", 404));
    }
    const { amount } = req.body;
    if (!amount) {
      return next(new ErrorHandler("Please place your bid", 400));
    }
    if (amount <= auctionItem.currentBid) {
      return next(
        new ErrorHandler(
          "Bid amount must be greater than current auction price.",
          400
        )
      );
    }
    if (amount <= auctionItem.startingBid) {
      return next(
        new ErrorHandler(
          "Bid amount must be greater than starting auction price.",
          400
        )
      );
    }

    const existingBid = await Bid.findOne({
      "bidder.id": req.User?._id,
      auctionItem: auctionItem._id,
    });
    const existingBidInAuction = auctionItem.bids.find(
      (bid) => bid.userId.toString() == req.User?._id.toString()
    );
    if (existingBid && existingBidInAuction) {
      existingBidInAuction.amount = amount;
      existingBid.amount = amount;
      await existingBid.save();
      await existingBidInAuction.save();
      auctionItem.currentBid = amount;
    } else {
      const bidderDetail = await UserActivation.findById(req.User._id);
      const bid = await Bid.create({
        amount,
        bidder: {
          id: bidderDetail._id,

          userName: bidderDetail.userName,
          profileImage: bidderDetail.profileImage?.url,
        },
        auctionItem: auctionItem._id,
      });
      auctionItem.bids.push({
        userId: req.user._id,
        userName: bidderDetail.userName,
        profileImage: bidderDetail.profileImage?.url,
        amount,
      });
      auctionItem.currentBid = amount;
    }
    await auctionItem.save();
    res.status(201).json({
      success:true,
      message:"Bid placed",
      currentBid:auctionItem.currentBid,
      bid
    })
  } catch (error) {
    console.log(error);
    next(new ErrorHandler("Internal server error", 500));
  }
};
