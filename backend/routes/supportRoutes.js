// routes/supportRoutes.js
const express = require("express");
const router = express.Router();
const { 
    createTicket, 
    getMyReports, // Controller se fetch ho raha hai
    addMessage,
    requestAgent 
} = require("../controllers/supportController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

// 🔥 ISSE UPDATE KARO (Frontend yehi maang raha hai)
router.get("/my-history", getMyReports); 

router.post("/create", createTicket);
router.post("/message/:id", addMessage);
router.patch("/ticket/:id/request-agent", requestAgent);

module.exports = router;