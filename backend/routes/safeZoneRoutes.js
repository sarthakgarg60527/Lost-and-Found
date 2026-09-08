const express = require('express');
const router = express.Router();
const { getNearbySafeZones, addSafeZone } = require('../controllers/safeZoneController');

// 🛡️ Middleware import karo
const { protect, admin } = require('../middleware/authMiddleware');

// 1. Safe zones dekhne ke liye login zaroori hai
router.get('/', protect, getNearbySafeZones);

// 2. Safe zone add karne ke liye Admin hona zaroori hai
// Pehle protect (login check), phir admin (role check)
router.post('/add', protect, admin, addSafeZone); 

module.exports = router;