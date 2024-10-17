import express from "express";
import {
  addNewAuctionItem,
  getAllItems,
  getAuctionDetails,
  getMyAuctionItem,
  removeFromAuction,
  republishItem,
} from "../controllers/auctionItem.controller.js";
import { AuthMiddleware, isAuthorized } from "../middlewares/auth.js";
import { trackCommisionStatus } from "../middlewares/trackCommisionStatus.js";

const route = express.Router();
route.post("/addauction",
   AuthMiddleware,
    isAuthorized,
    trackCommisionStatus,
     addNewAuctionItem
    );
route.get("/allitems", getAllItems);
route.get("/auction/:id",
   AuthMiddleware, 
   getAuctionDetails
  );
route.get(
  "/getmyauctions",
  AuthMiddleware,
  isAuthorized("Auctioneer"),
  getMyAuctionItem
);
route.delete(
  "/delete/:id",
  AuthMiddleware,
  isAuthorized("Auctioneer"),
  removeFromAuction
);
route.put(
  "/item/republish/:id",
  AuthMiddleware,
  isAuthorized("Auctioneer"),
  republishItem
);
export default route;
