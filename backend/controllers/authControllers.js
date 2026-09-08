const User = require("../models/User")
const bcrypt = require("bcryptjs")
const cloudinary = require("../config/cloudinary");
const Message = require("../models/Message");
const mongoose = require("mongoose");
const sendEmail = require("../utils/sendEmail");
const fs = require("fs");
const generateToken =
require("../utils/generateToken");
// ✅ Register User

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, role, adminSecretKey } = req.body;

        console.log("--- DEBUG ADMIN REGISTER ---");
        console.log("Role Received:", role);
        const emailRegex =
/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(email)) {
    return res.status(400).json({
        message: "Invalid email format"
    });
}
const phoneRegex = /^[6-9]\d{9}$/;

if (phone && !phoneRegex.test(phone)) {
    return res.status(400).json({
        message: "Invalid phone number"
    });
}
        // 1. Password Validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: "Password must include Upper, Lower, Number & Special char."
            });
        }

        // 2. Admin Security Check
        if (role === "admin") {
            if (adminSecretKey !== process.env.ADMIN_SECRET_KEY) {
                return res.status(403).json({ message: "Invalid Admin Secret Key ❌" });
            }
        }

        // 3. Check Existing User
      const query = [
   { email: email.toLowerCase().trim() }
];

if (phone && phone.trim() !== "") {
   query.push({
      phone: phone.trim()
   });
}

const userExists = await User.findOne({
   $or: query
});

        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // 4. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 🔥 5. ROLE BASED LOGIC
        let otp = null;
        let otpExpires = null;
        let isVerified = false;
        let verificationStatus = "none";

        if (role !== "admin") {
            // 👤 USER → OTP
            otp = Math.floor(100000 + Math.random() * 900000).toString();
            otpExpires = Date.now() + 10 * 60 * 1000;
        } else {
            // 👑 ADMIN → direct verified
            isVerified = true;
            verificationStatus = "approved";
        }
        const allowedRole =
    role === "admin"
    ? "admin"
    : "user";

        // 6. Create User
        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            phone: phone ? phone.trim() : "",
            role: allowedRole,
            verificationStatus,
            otp,
            otpExpires,
            isVerified
        });

      if (allowedRole === "admin"){

    const safeUser = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
    };

    return res.status(201).json({
        message: "Admin registered successfully ✅",
        user: safeUser
    });
}

        // 🔥 8. USER EMAIL SEND
        try {
            await sendEmail({
                email: user.email,
                subject: "Verify Your FoundIt Account",
                message: `<p>Your OTP is: <b>${otp}</b></p>`
            });

            return res.status(201).json({
                message: "OTP sent to email 📩",
                email: user.email
            });

        } catch (err) {
            console.log("❌ Email Error:", err.message);

            // ❗ IMPORTANT: user delete nahi karna
           return res.status(500).json({
    message:
    "User created but OTP email failed"
});
        }

    } catch (error) {
        console.error(error);

res.status(500).json({
    message: "Internal server error"
});
    }
};
// ✅ VERIFY OTP
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        const cleanEmail = email.toLowerCase().trim();
        const cleanOtp = String(otp).trim(); // Force string conversion

        // 1. Pehle sirf User dhundo email se
        const user = await User.findOne({ email: cleanEmail });

        if (!user) {
            console.log("❌ User not found in DB:", cleanEmail);
            return res.status(400).json({ message: "User not found" });
        }

        // 2. Debug logs (Terminal mein dekhna kya aa raha hai)
        console.log("--- DEBUG VERIFY ---");
        console.log("DB OTP:", user.otp, "| Frontend OTP:", cleanOtp);
        console.log("DB Expiry:", user.otpExpires, "| Current Time:", Date.now());

        // 3. OTP Match Check (Manual comparison is safer than findOne)
        if (!user.otp) {
    return res.status(400).json({
        message:
        "OTP already used or invalid"
    });
}
        if (String(user.otp) !== cleanOtp) {
            return res.status(400).json({ message: "Invalid OTP code ❌" });
        }

       if (!user.otpExpires || user.otpExpires < Date.now()) {
    return res.status(400).json({
        message: "OTP has expired ⏰"
    });
}
        // 5. Verification Success
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        user.verificationStatus = "approved";
        await user.save();

const token = generateToken(user);

        res.status(200).json({
            message: "Account verified successfully",
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified
            }
        });

    } catch (error) {
        console.error("Verify OTP Error:", error);
        res.status(500).json({ message: "Server error during verification" });
    }
};

// ✅ FORGOT PASSWORD (Send OTP)
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email.toLowerCase().trim() });
       if (!user) {
    return res.status(200).json({
        message:
        "If account exists, OTP sent successfully"
    });
}

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        await sendEmail({
            email: user.email,
            subject: "Password Reset OTP - FoundIt",
            message: `<p>Your password reset code is: <b>${otp}</b></p>`
        });
        res.json({ message: "Reset OTP sent to email" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ 
            email: email.toLowerCase().trim(), 
            otp: otp.trim(), 
            otpExpires: { $gt: Date.now() } 
        });

        if (!user) return res.status(400).json({ message: "Invalid or expired OTP" });
        const passwordRegex =
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
        message: "Weak password"
    });
}
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({ message: "Password reset successful!" });
    } catch (error) {
        res.status(500).json({ message: "Error resetting password" });
    }
};
exports.loginUser = async (req, res) => {
    try {
        const { email, password, isAdminLogin } = req.body;

        const cleanEmail = email.toLowerCase().trim();

        const user = await User.findOne({
            email: cleanEmail
        }).select("+password +role");

     // ❌ User not found
if (!user) {
    return res.status(400).json({
        message: "Invalid email or password"
    });
}

// ❌ Admin trying user login page
if (
    !isAdminLogin &&
    user.role === "admin"
) {
    return res.status(403).json({
        message:
        "Please login from Admin Login page"
    });
}

// ❌ User trying admin login page
if (
    isAdminLogin &&
    user.role !== "admin"
) {
    return res.status(403).json({
        message:
        "ACCESS DENIED: Admins Only 🛑"
    });
}

// ❌ Verify first
if (
    !user.isVerified &&
    user.role !== "admin"
) {
    return res.status(403).json({
        message:
        "Please verify your account first"
    });
}

// ❌ Password mismatch
const isMatch = await bcrypt.compare(
    password,
    user.password
);

if (!isMatch) {
    return res.status(400).json({
        message: "Invalid email or password"
    });
}
        // ✅ Token
      const token = generateToken(user);

        // ✅ Response
        res.status(200).json({
            message: "Login successful ✅",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("LOGIN ERROR:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};
// ✅ GET PROFILE - FIXED: verificationStatus explicitly select ho raha hai
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select("+verificationStatus +idProof +verificationRequested +isVerified")
            .populate("posts");

        if (!user) return res.status(404).json({ message: "User not found" });

        // 🔍 DEBUG - server console mein check karo
        console.log("--- DEBUG getProfile ---");
        console.log("User ID:", user._id);
        console.log("verificationStatus:", user.verificationStatus);
        console.log("isVerified:", user.isVerified);
        console.log("Posts count:", user.posts?.length);

        res.json(user);
    } catch (error) {
        console.error("Profile Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ✅ UPDATE PROFILE
exports.updateProfile = async (req, res) => {
    try {

        const user =
        await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // ✅ Phone validation
        if (req.body.phone) {

            const phoneRegex =
            /^[6-9]\d{9}$/;

            if (
                !phoneRegex.test(
                    req.body.phone
                )
            ) {
                return res.status(400).json({
                    message:
                    "Invalid phone number"
                });
            }

            const existingPhone =
            await User.findOne({
                phone: req.body.phone,
                _id: { $ne: user._id }
            });

            if (existingPhone) {
                return res.status(400).json({
                    message:
                    "Phone already in use"
                });
            }
        }

        // ✅ Update fields
        user.name =
        req.body.name || user.name;

        user.phone =
        req.body.phone || user.phone;

        user.bio =
        req.body.bio !== undefined
        ? req.body.bio
        : user.bio;

        user.address =
        req.body.address !== undefined
        ? req.body.address
        : user.address;

        const updatedUser =
        await user.save({
            validateBeforeSave: false
        });

        res.json(updatedUser);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message:
            "Internal server error"
        });
    }
};

// ✅ VERIFICATION REQUEST - User ID proof bhejta hai
exports.requestVerification = async (req, res) => {
    try {
        console.log("--- DEBUG: Verification Request Started ---");
        const userId = req.user._id || req.user.id;
        
        if (!req.file) {
            return res.status(400).json({ message: "File nahi mili!" });
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "user_verifications",
        });
        if (fs.existsSync(req.file.path)) {
    fs.unlinkSync(req.file.path);
}
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // 🔥 CRITICAL FIX: Jab bhi naya ID upload ho, isVerified ko false karo
        user.isVerified = false;  // <--- YE LINE ADD KAR BINA MISS KIYE
        user.verificationStatus = "pending";
        user.verificationRequested = true;
        user.idProof = result.secure_url;
        
       await user.save();

        console.log("--- DEBUG: User saved with pending status and isVerified: false ---");
        res.json({ success: true, imageUrl: result.secure_url });

    } catch (error) {
        console.error(error);

res.status(500).json({
    message: "Internal server error"
});
    }
};

// ✅ ADMIN: User ko approve karo
exports.adminApproveUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user) return res.status(404).json({ message: "User not found" });

        user.isVerified            = true;
        user.verificationStatus    = "approved";
        user.verificationRequested = false;
        user.karmaPoints          += 20;

        await user.save();

        res.json({ message: "User verified successfully ✅" });

    } catch (error) {
       console.error(error);

res.status(500).json({
    message: "Internal server error"
});
    }
};

// ✅ ADMIN: Pending verification requests fetch karo
exports.getPendingVerifications = async (req, res) => {
    try {
        console.log("--- DEBUG: Admin Fetching Pending Users ---");

        const users = await User.find({ verificationRequested: true })
            .select("name email idProof verificationStatus");

        console.log("--- DEBUG: Pending users found:", users.length);
        if (users.length > 0) {
            console.log("--- DEBUG: First user idProof:", users[0].idProof);
        }

        res.json(users);

    } catch (error) {
     console.error(error);

res.status(500).json({
    message: "Internal server error"
});
    }
};

// ✅ PROFILE PHOTO UPLOAD
exports.uploadProfilePhoto = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;

        if (!req.file) {
            return res.status(400).json({ message: "Photo select karo!" });
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "user_profiles",
            transformation: [{ width: 500, height: 500, crop: "limit" }]
        });
        if (fs.existsSync(req.file.path)) {
    fs.unlinkSync(req.file.path);
} const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User nahi mila" });

        user.profileImage = result.secure_url;
       await user.save();

        res.json({
            message: "Profile photo updated! 🚀",
            profileImage: result.secure_url
        });

    } catch (error) {
        console.error("Profile Upload Error:", error);
        res.status(500).json({ message: "Upload fail ho gaya", error: error.message });
    }
};

// ✅ GET USER CHATS (Inbox)
exports.getUserChats = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        console.log("🔍 Fetching chats for User ID:", userId);

        const messages = await Message.find({
            $or: [
                { senderId: new mongoose.Types.ObjectId(userId) },
                { receiverId: new mongoose.Types.ObjectId(userId) }
            ]
        })
        .sort({ createdAt: -1 })
        .populate("itemId", "title image")
        .populate("senderId receiverId", "name profileImage");

        console.log(`📩 Total messages found: ${messages.length}`);

        const chatList = [];
        const seenRooms = new Set();

        for (const msg of messages) {
            const currentRoom = msg.roomId;

            if (currentRoom && !seenRooms.has(currentRoom.toString())) {
                seenRooms.add(currentRoom.toString());

                if (!msg.senderId || !msg.receiverId) continue;

                const otherUser = msg.senderId._id.toString() === userId.toString()
                    ? msg.receiverId
                    : msg.senderId;

                chatList.push({
                    roomId: currentRoom,
                    lastMessage: msg.text,
                    time: msg.time,
                    item: msg.itemId,
                    otherUser: {
                        _id: otherUser._id,
                        name: otherUser.name,
                        profileImage: otherUser.profileImage
                    },
                    updatedAt: msg.createdAt
                });
            }
        }

        console.log(`✅ Final Chat List Count: ${chatList.length}`);
        res.json(chatList);

    } catch (error) {
        console.error("❌ Inbox Error:", error.message);
        res.status(500).json({ message: "Inbox error", error: error.message });
    }
};

// ✅ GET USER BY ID (Chat window ke liye)
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select("name email profileImage isVerified role");

        // 🔥 SECURITY: Agar koi normal user Admin ki ID se URL hit kare toh hide karo
        if (!user || user.role === 'admin') {
            return res.status(404).json({ message: "User database mein nahi hai ya access restricted hai!" });
        }

        res.json(user);

    } catch (error) {
        console.error("Error fetching user by ID:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
// ✅ LEADERBOARD
exports.getLeaderboard = async (req, res) => {
    try {
        // 🔥 FIX: Sirf normal users dikhao jinka role 'admin' nahi hai
        const leaders = await User.find({ role: { $ne: "admin" } })
            .select("name karmaPoints profileImage isVerified totalEarnings")
            .sort({ karmaPoints: -1 })
            .limit(10);

        const formattedLeaders = leaders.map(user => ({
            _id: user._id,
            name: user.name,
            points: user.karmaPoints || 0,
            karmaPoints: user.karmaPoints || 0,
            totalEarnings: user.totalEarnings || 0,
            profileImage: user.profileImage,
            isVerified: user.isVerified,
            rankTitle: user.rank // Schema virtual ya logic se aayega
        }));

        res.status(200).json(formattedLeaders);

    } catch (error) {
        console.error("Leaderboard Error:", error);
        res.status(500).json({ message: "Leaderboard load nahi ho pa raha" });
    }
};