import express from "express";
import { AuthMiddleware, isAuthorized } from "../middlewares/auth.js";
import { proofOfCommision } from "../controllers/commission.controller.js";

const route = express.Router();
route.post(
  "/proof",
  AuthMiddleware,
  isAuthorized("Auctioneer"),
  proofOfCommision
);

export default route;
