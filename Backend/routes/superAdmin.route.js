import express from "express";
import { AuthMiddleware, isAuthorized } from "../middlewares/auth.js";
import {
  deleteAuctionItem,
  getAllPayementProofs,
  getPayementProofDetail,
  updateProofStatus,
  deletePayementProof,
} from "../controllers/superAdmin.controller.js";
const route = express.Router();

route.delete(
  "/auctionitem/delete/:id",
  AuthMiddleware,
  isAuthorized("Super Admin"),
  deleteAuctionItem
);
route.get(
  "/payemntproofs/getall",
  AuthMiddleware,
  isAuthorized("Super Admin"),
  getAllPayementProofs
);
route.get(
  "/payemntproof/:id",
  AuthMiddleware,
  isAuthorized("Super Admin"),
  getPayementProofDetail
);
route.put(
  "/payemntproof/status/update/:id",
  AuthMiddleware,
  isAuthorized("Super Admin"),
  updateProofStatus
);
route.delete(
  "/payemntproof/delete/:id",
  AuthMiddleware,
  isAuthorized("Super Admin"),
  deletePayementProof
);
export default route;
