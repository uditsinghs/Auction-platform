import { User } from "../models/user.model.js";
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken";

export const AuthMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return next(
        new ErrorHandler("Unauthorized user, no token provided", 401)
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY_SECRET);

    const loggedinUser = await User.findById(decoded.id);

    if (!loggedinUser) {
      return next(new ErrorHandler("Unauthorized user, user not found", 401));
    }

    req.user = loggedinUser;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new ErrorHandler("Invalid token, authorization denied", 401));
    }

    if (error.name === "TokenExpiredError") {
      return next(new ErrorHandler("Token expired, please login again", 401));
    }

    console.error("Authentication Error:", error);
    return next(new ErrorHandler("Internal server error", 500));
  }
};

export const isAuthorized = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return next(
        new ErrorHandler(
          `${req.user?.role} is not allowed not access the resource.`,
          403
        )
      );
    }
    next()
  };
};
