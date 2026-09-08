const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    verifyOTP,
    forgotPassword,
    resetPassword
} = require("../controllers/authControllers");

// ✅ Rate Limiters
const {
    loginLimiter,
    forgotLimiter
} = require("../middleware/rateLimiter");

// --- Registration & Login ---
router.post("/register", registerUser);

router.post(
    "/login",
    loginUser
);

// --- OTP Verification ---
router.post(
    "/verify-otp",
    verifyOTP
);

// --- Forgot Password Flow ---
router.post(
    "/forgot-password",
    forgotLimiter,
    forgotPassword
);

router.post(
    "/reset-password",
    resetPassword
);

module.exports = router;