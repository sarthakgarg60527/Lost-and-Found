const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
// const { protect, admin } = require("../middleware/authMiddleware");

// 📁 Multer Setup (Disk Storage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"), 
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

const { protect, admin } = require("../middleware/authMiddleware");

const { 
    updateProfile, 
    getProfile, 
    requestVerification, 
    adminApproveUser,
    getPendingVerifications,
    uploadProfilePhoto,
    getUserChats,
    getUserById,
    getLeaderboard
} = require("../controllers/authControllers");

// ================= PUBLIC / SEMI-PUBLIC ROUTES =================
router.get("/leaderboard", getLeaderboard); 

// ================= PROTECTED ROUTES (Login Required) =================
router.use(protect); // 🛡️ Iske niche ke saare routes automatically protected hain

// 💬 Chat & Inbox
router.get("/my-chats", getUserChats); 

// 👤 Profile Operations
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/profile-photo", upload.single("profilePhoto"), uploadProfilePhoto);

// ✅ Verification System
router.post("/verify-request", upload.single("image"), requestVerification);

// 🔑 Admin Specific (Inhe actually adminRoutes mein hona chahiye par yahan hain toh secure rakho)
router.get("/admin/pending-requests", getPendingVerifications);
router.put("/admin/approve/:userId", admin, adminApproveUser);

// 🔍 User Lookup (Humesha Sabse Niche)
// Kyunki /:id kisi bhi word ko capture kar sakta hai
router.get("/:id", getUserById);

module.exports = router;