import jwt from "jsonwebtoken";
import { db } from "./db.js"; // ✅ ADD THIS

export const verifyToken = async (req, res, next) => { // ✅ make async
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 ADD THIS BLOCK HERE (VERY IMPORTANT)
    const [rows] = await db.execute(
      "SELECT token_status FROM users WHERE id = ?",
      [decoded.id]
    );

    if (!rows.length || rows[0].token_status !== "active") {
      return res.status(401).json({ message: "Token expired" });
    }

    // ✅ AFTER CHECK
    req.user = decoded;
    next();

  } catch (err) {
    console.error("JWT Error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};