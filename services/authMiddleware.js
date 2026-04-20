import jwt from "jsonwebtoken";
import { db } from "./db.js";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Invalid token format" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ session check
    const [rows] = await db.execute(
      `SELECT status, expires_at FROM user_sessions 
       WHERE token = ? AND user_id = ?`,
      [token, decoded.id]
    );

    if (!rows.length || rows[0].status !== "active") {
      return res.status(401).json({ message: "Invalid session" });
    }

    const expiresAt = new Date(rows[0].expires_at).getTime();
    const now = Date.now();

    if (!expiresAt) {
      return res.status(401).json({ message: "Invalid session expiry" });
    }

    if (expiresAt < now) {
      await db.execute(
        "UPDATE user_sessions SET status = 'expired' WHERE token = ?",
        [token]
      );

      return res.status(401).json({ message: "Session expired" });
    }

    req.user = decoded;
    next();

  } catch (err) {
    console.error("JWT Error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};