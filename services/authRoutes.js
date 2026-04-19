import express from "express";
import { signup, login, googleLogin, getUser, logout } from "./authController.js";
import { verifyToken } from "./authMiddleware.js";
import { verifyCaptcha } from "./verifyCaptcha.js";     

const router = express.Router();

router.post("/signup", verifyCaptcha, signup); // ✅ updated
router.post("/login", verifyCaptcha, login);   // ✅ updated
router.post("/google", googleLogin);
router.get("/get-user", verifyToken, getUser);
router.post("/logout", verifyToken, logout);

export default router;