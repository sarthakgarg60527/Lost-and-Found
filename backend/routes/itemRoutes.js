const express = require("express");
const router = express.Router();
const itemController = require("../controllers/itemController"); 
const { protect, isVerifiedUser } = require("../middleware/authMiddleware"); 
const upload = require("../middleware/uploadMiddleware");

// --- 🕵️‍♂️ 1. AI SUGGESTIONS ROUTES (Must be ABOVE /:id) ---

// Ye Home.jsx ke RightSidebar ke liye hai
router.get("/suggestions", protect, itemController.fetchSuggestions); 

// Ye create post karte waqt check karne ke liye hai
router.get("/check-suggestions", protect, itemController.checkPotentialMatches);


// --- 🚀 2. CREATE ITEM ---
router.post("/", 
    protect, 
    isVerifiedUser, 
    upload.single("image"), 
    itemController.createItem
);


// --- ✅ 3. HANDOVER & OTP LOGIC ---
router.post("/confirm-handover", protect, itemController.confirmHandover);
router.post("/generate-otp/:id", protect, itemController.generateOTP);
router.post("/verify-handover", protect, itemController.verifyHandover);


// --- 🗑️ 4. DELETE POST ---
router.delete("/:id", protect, itemController.deleteItem); 


// --- 📄 5. GET ITEMS (Read operations) ---
router.get("/", itemController.getItems);
router.get("/nearby", protect, itemController.getNearbyItems);

// 🚨 Sabse important: ID wali route humesha sabse niche honi chahiye
router.get("/:id", itemController.getItemById); 

module.exports = router;