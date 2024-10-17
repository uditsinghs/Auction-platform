import ErrorHandler from "./error.js";
import { User } from "../models/user.model.js";
export const trackCommisionStatus = async (req, resizeBy, next) => {
  try {
    const user = await User.findById(req.user?._id);
    if (user.unpaidCommission > 0) {
      return next(
        new ErrorHandler(
          "You have some unpaid commisions. please pay them before posting another auction",
          403
        )
      );
    }
    next();
  } catch (error) {
    console.log(error);
  }
};
