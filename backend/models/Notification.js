const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    // 👤 Kisko notification mil rahi hai
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true // 👈 Speed ke liye index zaroori hai
    },

    // 📩 Kisne action kiya (e.g., Jisne item return kiya ya admin ne)
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    // 🏷️ Notification ki category (Frontend par Icons dikhane ke kaam aayega)
    type: {
        type: String,
        enum: ["handover", "verification", "reward", "system", "message", "match"],
        required: true
    },

    title: {
        type: String,
        required: true
    },

    message: {
        type: String,
        required: true
    },

    // 📦 Kis item se related hai (Optional)
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item"
    },

    // 🔴 Status: Read or Unread
    read: {
        type: Boolean,
        default: false
    },

    // 🔗 Extra Link: Agar kisi specific page par bhejna ho
    link: {
        type: String,
        default: ""
    }

}, { timestamps: true });

// Ek user ke saare unread notifications jaldi dhoondne ke liye composite index
notificationSchema.index({ user: 1, read: 1 });

module.exports = mongoose.model("Notification", notificationSchema);