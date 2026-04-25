import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { db } from "./db.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// TEMP STORAGE (replace with DB later)
let users = [];

// ✅ SIGNUP
export const signup = async (req, res) => {
  try {
    const { name, email, password, mobile_number } = req.body;

    // ✅ validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // 🔍 check if user exists
    const [existing] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 🔐 hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 💾 insert into DB
    const [result] = await db.execute(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, hashedPassword || null]
    );

    // 🎟 generate JWT
    const token = jwt.sign(
      { id: result.insertId, email, name }, // ✅ added name
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    // ✅ SAVE TOKEN
   await db.execute(
  "INSERT INTO user_sessions (user_id, token, expires_at, status) VALUES (?, ?, ?, 'active')",
  [
    result.insertId,
    token,
    new Date(Date.now() + 12 * 60 * 60 * 1000)
  ]
);

    res.json({ message: "Signup successful", token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔍 find user
    const [users] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = users[0];

    // 🔐 compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // 🎟 JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name }, // ✅ added name
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    // ✅ SAVE TOKEN IN DB
    await db.execute(
  "INSERT INTO user_sessions (user_id, token, expires_at, status) VALUES (?, ?, ?, 'active')",
  [
    user.id,
    token,
    new Date(Date.now() + 12 * 60 * 60 * 1000)
  ]
);

    res.json({ message: "Login successful", token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ GOOGLE LOGIN
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, sub } = payload;

    const [users] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    let user;

    if (users.length === 0) {
      const [result] = await db.execute(
        "INSERT INTO users (name, email, google_id) VALUES (?, ?, ?)",
        [name, email, sub]
      );

      user = { id: result.insertId, email, name };
    } else {
      user = users[0];
    }

    const jwtToken = jwt.sign(
      { id: user.id, email: user.email, name: user.name || name }, // ✅ FIX
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    // ✅ Save token
   await db.execute(
  "INSERT INTO user_sessions (user_id, token, expires_at, status) VALUES (?, ?, ?, 'active')",
  [
    user.id,
    jwtToken,
    new Date(Date.now() + 12 * 60 * 60 * 1000)
  ]
);

    res.json({
      message: "Google login success",
      token: jwtToken
    });

  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid Google token" });
  }
};

//Get user details
export const getUser = (req, res) => {
  try {
    res.json({
      success: true,
      username: req.user.name   // comes from JWT
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

//Logout 

export const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];

    await db.execute(
      "UPDATE user_sessions SET status = 'expired' WHERE token = ?",
      [token]
    );

    res.json({ success: true, message: "Logged out" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};