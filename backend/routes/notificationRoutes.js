const express = require("express")
const router = express.Router()

const { protect } = require("../middleware/authMiddleware")
const notificationController = require("../controllers/notificationController")


// GET NOTIFICATIONS
router.get("/", protect, notificationController.getNotifications)


// MARK ALL READ (IMPORTANT ABOVE :id)
router.put("/read-all", protect, notificationController.markAllRead)


// MARK SINGLE READ
router.put("/read/:id", protect, notificationController.markRead)


module.exports = router