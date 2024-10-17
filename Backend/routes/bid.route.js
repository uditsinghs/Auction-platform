import express from "express";
import { placeBid } from "../controllers/bid.controller.js";
import { AuthMiddleware, isAuthorized } from "../middlewares/auth.js";
import { checkAuctionEndTime } from "../middlewares/checkAuctionEndTime.js";
const route = express.Router();
route.post(
  "/place/:id",
  AuthMiddleware,
  isAuthorized("Bidder"),
  checkAuctionEndTime,
  placeBid
);
export default route;
