const User = require("../models/User");
const Item = require("../models/Item");
const mongoose = require("mongoose");
const cloudinary = require("../config/cloudinary");

// ================= USERS =================

// 1️⃣ Get All Users (Fixed for Cloudinary Images)
// 1️⃣ Get All Users (Performance Optimized)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.aggregate([
            // 🛑 STEP 1: Filter out Admins (Sirf users dikhao)
            { 
                $match: { role: { $ne: "admin" } } 
            },
            
            // Baki poora pipeline same rahega...
            {
                $lookup: {
                    from: "items",
                    let: { user_id: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: [{ $type: "$postedBy" }, "objectId"] },
                                        { $eq: ["$postedBy", "$$user_id"] }
                                    ]
                                }
                            }
                        },
                        { $project: { _id: 1 } }
                    ],
                    as: "posts"
                }
            },
            {
                $addFields: {
                    totalPosts: { $size: "$posts" },
                    safeKarma: { $ifNull: ["$karmaPoints", 0] }
                }
            },
            {
                $addFields: {
                    rank: {
                        $cond: { 
                            if: { $gte: ["$safeKarma", 500] }, then: "Legend", 
                            else: { $cond: { 
                                if: { $gte: ["$safeKarma", 200] }, then: "Pro", 
                                else: { $cond: { if: { $gte: ["$safeKarma", 50] }, then: "Active", else: "Newbie" } } 
                            } } 
                        }
                    }
                }
            },
            { $project: { password: 0, __v: 0, posts: 0, safeKarma: 0 } }
        ]);

        console.log(`✅ System: Filtered ${users.length} Operatives.`);
        res.json(users);
    } catch (error) {
        console.error("🔴 Aggregation Failure:", error.message);
        res.status(500).json({ message: "Users fetch failed" });
    }
};
// 2️⃣ Update Karma (Baki code sahi hai bas validateBeforeSave handle kar diya)
exports.updateUserKarma = async (req, res) => {
    try {
        const { userId, points } = req.body;

        // ✅ Atomic update using $inc (Industrial Standard)
        const user = await User.findByIdAndUpdate(
            userId,
            { $inc: { karmaPoints: parseInt(points) } }, 
            { new: true, validateBeforeSave: false }
        );

        if (!user) return res.status(404).json({ message: "User nahi mila" });

        res.json({ message: "Karma updated successfully", karma: user.karmaPoints });
    } catch (error) {
        console.error("Karma Error:", error);
        res.status(500).json({ message: "Karma update fail" });
    }
};

// ... (Baki functions same rahenge)

// 3️⃣ Ban / Unban User
// 3️⃣ Restrict / Unverify User (No more toggling to verified)
exports.toggleUserBan = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User nahi mila" });
        }

        // 🔥 FIX: Restrict ka matlab hai verified status 'false' karna.
        // Ise hamesha false rakho, flip (!) mat karo.
        user.isVerified = false; 
        user.verificationStatus = "none"; 
        user.verificationRequested = false;

        await user.save({ validateBeforeSave: false });

        res.json({
            message: "User access restricted and unverified",
            isVerified: false
        });

    } catch (error) {
        console.error("Ban Error:", error);
        res.status(500).json({ message: "Action failed" });
    }
};


// 4️⃣ Approve Verification
exports.approveVerification = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User nahi mila" });
        }

        // ✅ FIX: Check if already approved (Points exploit guard)
        if (user.verificationStatus === "approved") {
            return res.status(400).json({ message: "Operative is already verified" });
        }

        user.isVerified = true;
        user.verificationStatus = "approved";
        user.verificationRequested = false;
        
        // Award points only for the first successful verification
        user.karmaPoints += 100;

        await user.save({ validateBeforeSave: false });

        res.json({ 
            message: "User Verified & +100 Karma Dispatched", 
            karma: user.karmaPoints 
        });

    } catch (error) {
        console.error("Approval Error:", error);
        res.status(500).json({ message: "Approval protocol failed" });
    }
};


// 5️⃣ Reject Verification
exports.rejectVerification = async (req, res) => {
    try {
        // ✅ Direct update: Fast and clean
        const user = await User.findByIdAndUpdate(
            req.params.id, 
            { 
                isVerified: false, 
                verificationStatus: "rejected", 
                verificationRequested: false 
            }, 
            { new: true, validateBeforeSave: false }
        );

        if (!user) {
            return res.status(404).json({ message: "User nahi mila" });
        }

        res.json({ message: "Verification rejected successfully" });

    } catch (error) {
        console.error("Rejection Error:", error);
        res.status(500).json({ message: "Rejection protocol failed" });
    }
};


// ================= ITEMS =================
exports.getAllItems = async (req, res) => {
    try {
        // Bina populate ke fetch karo pehle
        const rawItems = await Item.find().sort({ createdAt: -1 }).limit(100).lean();

        const safeItems = await Promise.all(rawItems.map(async (item) => {
            // Check if postedBy is valid ObjectId and NOT a string like "Uv genius"
            const isValidUser = mongoose.Types.ObjectId.isValid(item.postedBy) && (typeof item.postedBy !== "string");

            if (isValidUser) {
                try {
                    return await Item.findById(item._id)
                        .populate("postedBy", "name email profileImage")
                        .populate("handoverTo", "name email profileImage")
                        .lean();
                } catch (e) { return item; }
            } else {
                return { ...item, postedBy: { name: "System Operative (Corrupt)", email: "N/A" } };
            }
        }));

        res.json(safeItems);
    } catch (error) {
        console.error("🔴 Fetch Items Error:", error.message);
        res.status(500).json({ message: "Items fetch failed" });
    }
};

// 9️⃣ Delete Fake Item
exports.deleteItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: "Item nahi mila" });
        }

        // 🔥 Industrial Fix: Agar image Cloudinary par hai, toh usey bhi delete karo
        if (item.image && item.image.includes("cloudinary")) {
            const publicId = item.image.split("/").pop().split(".")[0]; 
            await cloudinary.uploader.destroy(`foundit/items/${publicId}`);
        }

        // Ab database se udao
        await Item.findByIdAndDelete(req.params.id);

        res.json({ message: "Item and linked assets purged successfully" });

    } catch (error) {
        console.error("Purge Error:", error);
        res.status(500).json({ message: "System failed to delete item" });
    }
};
// 📊 GET DASHBOARD ANALYTICS
exports.getDashboardStats = async (req, res) => {
    try {
     const [totalUsers, totalItems, returnedItems, escrowData] = await Promise.all([
    // 🛑 Yahan filter lagao taaki sirf normal users count hon
    User.countDocuments({ role: { $ne: "admin" } }), 
    Item.countDocuments(),
    Item.countDocuments({ status: "returned" }),
    Item.aggregate([
        { $match: { escrowStatus: "deposited" } },
        { 
            $group: { 
                _id: null, 
                total: { 
                    $sum: { 
                        $convert: { 
                            input: "$rewardAmount", 
                            to: "double", 
                            onError: 0, 
                            onNull: 0 
                        } 
                    } 
                } 
            } 
        }
    ])
]);

        const monthlyStats = await Item.aggregate([
            { $match: { createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) } } },
            { $group: { _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } }, count: { $sum: 1 } } },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
            { $project: { _id: 0, label: { $concat: [{ $toString: "$_id.month" }, "-", { $toString: "$_id.year" }] }, count: 1 } }
        ]);

        const categoryStats = await Item.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $project: { name: { $ifNull: ["$_id", "Other"] }, count: 1, _id: 0 } }
        ]);

        res.json({
            cards: {
                users: totalUsers,
                items: totalItems,
                successfulHandovers: returnedItems,
                escrowHoldings: escrowData[0]?.total || 0
            },
            graphs: { monthlyGrowth: monthlyStats, topCategories: categoryStats }
        });
    } catch (error) {
        console.error("🔴 Stats Error:", error.message);
        res.status(500).json({ message: "Analytics fetch failed" });
    }
};