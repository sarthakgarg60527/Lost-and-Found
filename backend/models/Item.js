const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
   title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true, index: true },

  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true },
    address: String
  },

  date: { type: Date, default: Date.now },
  image: { type: String, required: true },

  type: { 
    type: String, 
    enum: ["lost", "found"], 
    required: true 
  },

  // ⭐ ADMIN MODERATION
  moderationStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },

  rewardAmount: { type: Number, default: 0 },

  escrowStatus: { 
    type: String, 
    enum: ["none", "deposited", "released", "refunded"], 
    default: "none" 
  },

  transactionId: { type: String },

  status: {
    type: String,
    enum: ["pending", "returned", "disputed"],
    default: "pending"
  },

  // 🔥 HANDOVER INTELLIGENCE FIELDS
  handoverOtp: { type: String, default: null },
  
  isHandedOver: { type: Boolean, default: false }, // Direct Check
  
  // models/Item.js mein ye hissa badlo
handoverTo: { 
  type: mongoose.Schema.Types.ObjectId, // 🔥 String ki jagah ObjectId karo
  ref: "User",                          // 🔥 User model se link karo
  default: null 
},

  handoverDate: { type: Date, default: null }, // Actual handover kab hua

  finderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    default: null 
  },

  tags: { type: [String], default: [] },

  postedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  
  matchedWith: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    default: null
  }

}, { timestamps: true });

itemSchema.index({ location: "2dsphere" });

module.exports = mongoose.models.Item || mongoose.model("Item", itemSchema);