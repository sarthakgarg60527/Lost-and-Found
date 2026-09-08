const express = require("express");
const router = express.Router();

// Middlewares
const { protect, admin } = require("../middleware/authMiddleware");

// Controllers (Destructured)
const { 
    getAllReports, 
    resolveReport, 
    addMessage,
    joinChat 
} = require("../controllers/supportController");

const { 
    getAllUsers,
    approveVerification,
    toggleUserBan,
    updateUserKarma,
    rejectVerification,
    getAllItems,
    deleteItem,
    getDashboardStats // 🔥 Correct reference
} = require("../controllers/adminController");

// ✅ SECURITY: Production mein inko uncomment zaroor karna
router.use(protect);
router.use(admin);

// ================= ANALYTICS =================
router.get("/stats", getDashboardStats); // 👈 Fixed: adminController hata diya kyunki upar destructure kiya hai

// ================= SUPPORT & LIVE CHAT =================
router.get("/reports", getAllReports); 
router.patch("/ticket/:id/join", joinChat); 
router.put("/reply/:id", addMessage); 
router.put("/reports/:id/resolve", resolveReport); 

// ================= USERS MANAGEMENT =================
router.get("/users", getAllUsers);
router.put("/approve/:id", approveVerification);
router.put("/reject/:id", rejectVerification);
router.put("/toggle-ban/:id", toggleUserBan);
router.put("/update-karma", updateUserKarma);

// ================= ITEMS MANAGEMENT =================
router.get("/items", getAllItems);
router.delete("/items/:id", deleteItem);

module.exports = router;