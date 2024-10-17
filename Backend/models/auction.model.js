import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    startingBid: Number,
    currentBid: { type: Number, default: 0 },
    startTime: String,
    endTime: String,
    category: String,
    condition: {
      type: String,
      enum: ["New", "Uses"],
    },
    image: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bids: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Bid",
        },
        userName: String,
        profileImage: String,
        amount: Number,
      },
    ],
    higestBidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    commisionCalculated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Auction = mongoose.model("Auction", auctionSchema);
