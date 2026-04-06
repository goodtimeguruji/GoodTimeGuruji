import express from "express";
import { signup, login, googleLogin, getUser, logout } from "./authController.js";
import { verifyToken } from "./authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleLogin);
router.get("/get-user", verifyToken, getUser);
router.post("/logout", verifyToken, logout);

export default router;