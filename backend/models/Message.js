const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    roomId: { type: String, required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: false },
    text: { type: String }, // Ab ye required: true hata do kyunki sirf image bhi ho sakti hai
    image: { type: String }, // Base64 ya URL ke liye
    time: { type: String, default: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
}, { timestamps: true });

module.exports = mongoose.model("Message", MessageSchema);