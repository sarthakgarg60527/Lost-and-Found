const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: [true, "Please provide your name"], trim: true },
    email: { type: String, required: [true, "Please provide an email"], unique: true, lowercase: true },
    
    // 🔥 YE DO FIELDS ADD KAR (OTP ke liye)
    otp: { type: String },
    otpExpires: { type: Date },

    bio: { type: String, default: "", trim: true },
    address: { type: String, default: "", trim: true },
    totalEarnings: { type: Number, default: 0 },
    verificationRequested: { type: Boolean, default: false },
    verificationStatus: { 
        type: String, 
        enum: ["none", "pending", "approved", "rejected", "verified"], // "verified" add kiya
        default: "none" 
    },
    idProof: { type: String },  
    password: { type: String, required: [true, "Password is required"], minlength: 8, select: false },
    phone: { type: String, required: [true, "Phone number is needed"], unique: true },
    role: { type: String, enum: ["user", "admin", "moderator"], default: "user" },
    isVerified: { type: Boolean, default: false },
    karmaPoints: { type: Number, default: 0 },
    profileImage: { type: String, default: "https://via.placeholder.com/150" },
    savedItems: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }]
}, { timestamps: true });

// Automatic Rank Calculation
userSchema.virtual('rank').get(function() {
    if (this.karmaPoints >= 500) return "Community Legend 👑";
    if (this.karmaPoints >= 200) return "Guardian Angel 🥈";
    if (this.karmaPoints >= 50) return "Rookie Finder 🥉";
    return "Newbie 🌱";
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.models.User || mongoose.model("User", userSchema);