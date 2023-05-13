import express from "express";
import {
  registerUser,
  loginUser,
  VerifyMail,
} from "../Controllers/AuthController.js";

const router = express.Router();
router.post("/register", registerUser);
// router.get("/verify", VerifyMail);
router.post("/login", loginUser);
export default router;
