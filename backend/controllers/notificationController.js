const Notification = require("../models/Notification");
const mongoose = require("mongoose");

// 1️⃣ GET USER NOTIFICATIONS (With Sender Info)
exports.getNotifications = async (req, res) => {
    try {
        console.log("Fetching notifications for user ID:", req.user._id);
        const notifications = await Notification.find({ user: req.user._id })
            // 🔥 populate sender taaki frontend par photo aur naam dikhe
            .populate("sender", "name profileImage") 
            // populate item agar title ya image dikhani ho
            .populate("item", "title image")
            .sort({ createdAt: -1 })
            .limit(30); // 20 se badha kar 30 kar diya hai standard ke liye
            console.log("Found Notifications:", notifications.length);
        res.json(notifications);
    } catch (err) {
        console.error("🔴 Get Notifications Error:", err.message);
        res.status(500).json({ message: "Failed to fetch notifications" });
    }
};

// 2️⃣ MARK SINGLE NOTIFICATION READ (With Security Check)
exports.markRead = async (req, res) => {
    try {
        // Sirf wahi banda read kar sake jisko bheji gayi hai
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id }, 
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: "Notification not found or unauthorized" });
        }

        res.json({ message: "Signal acknowledged", notification });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 3️⃣ MARK ALL READ (Bulk Update)
exports.markAllRead = async (req, res) => {
    try {
        const result = await Notification.updateMany(
            { user: req.user._id, read: false },
            { read: true }
        );

        res.json({ 
            message: "All clear! Workspace cleaned.", 
            count: result.modifiedCount 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 4️⃣ DELETE OLD NOTIFICATIONS (Optional - for maintenance)
exports.deleteNotification = async (req, res) => {
    try {
        await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        res.json({ message: "Notification purged." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};