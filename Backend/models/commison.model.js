import mongoose from "mongoose";

const commisionSchema = new mongoose.Schema(
  {
    amount: Number,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Commision  = mongoose.model("Commision",commisionSchema)