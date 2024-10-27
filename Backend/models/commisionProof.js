import mongoose from "mongoose";

const paymentProofSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    proof: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Approved", "Rejected", "Settled"],
    },
    amount: {
      type: Number,
    },
    comment: {
      type: String,
    },
  },
  { timestamps: true }
);

export const PaymentProof = mongoose.model(
  "PaymentProof",
  paymentProofSchema
);
