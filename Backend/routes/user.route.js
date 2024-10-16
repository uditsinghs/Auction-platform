import express from "express";
import {
  fetchLeaderBoard,
  getProfile,
  login,
  logout,
  register,
} from "../controllers/user.controller.js";
import { AuthMiddleware } from "../middlewares/auth.js";

const route = express.Router();
route.post("/register", register);
route.post("/login", login);
route.get("/me", AuthMiddleware, getProfile);
route.post("/logout",AuthMiddleware, logout);
route.get("/leaderboard", fetchLeaderBoard);

export default route;
