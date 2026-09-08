const rateLimit =
require("express-rate-limit");

// ✅ Login limiter
exports.loginLimiter =
rateLimit({
    windowMs:
    15 * 60 * 1000,

    max: 100,

    message: {
        message:
        "Too many login attempts. Try again later."
    }
});

// ✅ Forgot password limiter
exports.forgotLimiter =
rateLimit({
    windowMs:
    15 * 60 * 1000,

    max: 100,

    message: {
        message:
        "Too many OTP requests."
    }
});