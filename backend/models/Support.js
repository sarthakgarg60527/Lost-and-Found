const mongoose = require("mongoose");

const supportSchema = new mongoose.Schema({
  ticketId: { type: String, unique: true }, 
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String, required: true },
  category: { 
    type: String, 
    enum: ["Technical Issue", "Verification", "Claim Dispute", "General Inquiry"], 
    default: "General Inquiry" 
  },
  priority: { 
    type: String, 
    enum: ["Low", "Medium", "High", "Urgent"], 
    default: "Low" 
  },
  // 🔥 'active' add kiya jab agent baat kar raha ho
  status: { type: String, enum: ["open", "active", "closed"], default: "open" },
  messages: [{
    sender: { type: String, enum: ["user", "admin"] },
    text: String,
    attachments: [String],
    createdAt: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

supportSchema.pre('save', function() {
  if (this.isNew && !this.ticketId) {
    this.ticketId = `#FIT-${Math.floor(1000 + Math.random() * 9000)}`;
  }
});

module.exports = mongoose.model("Support", supportSchema);