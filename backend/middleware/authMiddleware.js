const jwt = require("jsonwebtoken");
const User = require("../models/User");

// 1. Protect Middleware
const protect = async (req, res, next) => {
  let token;
console.log("📩 HEADERS:", req.headers.authorization);
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✅ DECODED:", decoded);
      // +role explicitly select kar rahe hain admin check ke liye
      const user = await User.findById(decoded.id).select("name email role isVerified");
      console.log("👤 USER:", user.email, user.role);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user; 
      next();

    } catch (error) {
      console.error("TOKEN ERROR:", error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// 2. Admin Middleware 👑
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: "Access Denied: Bhai, aap admin nahi ho! ❌" 
    });
  }
};

// 3. Verified User Middleware 🛡️
const isVerifiedUser = (req, res, next) => {
  if (req.user && req.user.isVerified) {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: "Bhai, pehle apni ID verify karwao! 🛡️" 
    });
  }
};

// Sabko export kar do - EK HI BAAR
module.exports = { protect, admin, isVerifiedUser };