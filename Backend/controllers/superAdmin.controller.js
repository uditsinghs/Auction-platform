import ErrorHandler from "../middlewares/error.js";
// import { User } from "../models/user.model.js";
// import { Commision } from "../models/commision.js";
import { Auction } from "../models/auction.model.js";
import { PaymentProof } from "../models/commisionProof.js";

export const deleteAuctionItem = async (req, res, next) => {
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

export const getAllPayementProofs = async (req, res, next) => {
  let paymentProofs = await PaymentProof.find();
  res.status(200).json({
    paymentProofs,
    success: true,
  });
  try {
  } catch (error) {
    console.log(error);

    next(new ErrorHandler(error.message || "Internal server error", 400));
  }
};

export const getPayementProofDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payemntProofDetail = await PaymentProof.findById(id);
    res.status(200).json({ success: true, payemntProofDetail });
  } catch (error) {
    console.log(error);
    next(new ErrorHandler(error.message || "Internal sever error", 500));
  }
};

export const updateProofStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId().isValid(id)) {
      return next(new ErrorHandler("Invalid ID format ", 400));
    }
    const { amount, status } = req.body;
    let proof = await PaymentProof.findById(id);
    if (!proof) {
      return next(new ErrorHandler("payment proof not found", 404));
    }
    proof = await PaymentProof.findByIdAndUpdate(
      id,
      { amount, status },
      { new: true, runValidators: true, useFindAndModify: false }
    );
    res.status(200).json({
      message: "payemnt proof updated successfully .",
      proof,
      success: true,
    });
  } catch (error) {
    console.log(error);
    next(new ErrorHandler(error.message || "Internal server error", 500));
  }
};

export const deletePayementProof = async (req, res, next) => {
  try {
    const { id } = req.params;

    let proof = await PaymentProof.findById(id);
    if (!proof) {
      return next(new ErrorHandler("payment proof not found", 404));
    }
    await proof.deleteOne();
    res.status(200).json({
      message: "payemnt proof deleted successfully .",
      proof,
      success: true,
    });
  } catch (error) {
    console.log(error);
    next(new ErrorHandler(error.message || "Internal server error", 500));
  }
};



