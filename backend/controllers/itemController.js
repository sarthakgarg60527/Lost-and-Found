const Item = require("../models/Item");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");
const mongoose = require("mongoose");
const axios = require("axios")
const Notification = require("../models/Notification")
const FormData = require("form-data")
const fs = require("fs")

async function checkImageMatch(queryImage, images){

const form = new FormData()

form.append("query", fs.createReadStream(queryImage))

for(const img of images){

const response = await axios.get(img,{responseType:"stream"})

form.append("dataset", response.data)

}

const res = await axios.post(
"http://localhost:8000/match",
form,
{ headers: form.getHeaders() }
)

return res.data

}
// --- CREATE ITEM ---
// --- CREATE ITEM ---
exports.createItem = async (req, res) => {
    try {
        let { title, description, location, category, date, type, lat, lng, rewardAmount } = req.body;

        // ✅ CLEANING LOCATION LOGIC (Frontend ke kachre ko yahi saaf kar do)
        let cleanAddress = location;
        if (typeof location === "string") {
            try {
                // Agar frontend ne JSON string bheja hai, toh uska sirf address nikal lo
                if (location.startsWith("{")) {
                    const parsed = JSON.parse(location);
                    cleanAddress = parsed.address || location;
                }
            } catch (e) {
                cleanAddress = location;
            }
        }

        // Faltu ke words hatao (Jaise tune pehle likha tha)
        const junk = ["municipal", "corporation", "office", "government", "division"];
        if (cleanAddress && typeof cleanAddress === "string") {
            const parts = cleanAddress.split(',');
            const cleanParts = parts.filter(p => !junk.some(j => p.toLowerCase().includes(j)));
            cleanAddress = cleanParts.length > 0 ? cleanParts.join(',').trim() : "Jaipur";
        }

        // Image Upload Logic...
        let imageUrl = "";
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, { folder: "lost_found" });
            imageUrl = result.secure_url;
        }

        const latitude = Number(lat);
        const longitude = Number(lng);

        // Smart Tags...
        const rawText = `${title} ${description} ${category}`.toLowerCase();
        const words = rawText.split(/\W+/);
        const stopWords = ['this', 'that', 'with', 'from', 'near', 'some', 'lost', 'found'];
        const smartTags = [...new Set(words.filter(w => w.length > 3 && !stopWords.includes(w)))];

        // ✅ SAVE TO DB
        const item = await Item.create({
            title,
            description,
            category,
            rewardAmount: Number(rewardAmount) || 0,
            location: {
                type: "Point",
                coordinates: [
                    isNaN(longitude) ? 75.7873 : longitude,
                    isNaN(latitude) ? 26.9124 : latitude
                ],
                address: String(cleanAddress) // 🔥 Ensure it's a clean string!
            },
            date,
            type,
            image: imageUrl,
            postedBy: req.user?._id,
            tags: smartTags,
            escrowStatus: "none"
        });

        await User.findByIdAndUpdate(req.user._id, { $push: { posts: item._id } });

        if (type === "found") {
            await User.findByIdAndUpdate(req.user._id, { $inc: { karmaPoints: 50 } });
        }

        // AI Matching Logic (Same as before)
        const potentialMatches = await Item.find({
            category: item.category,
            type: item.type === "lost" ? "found" : "lost", 
            _id: { $ne: item._id },
            tags: { $in: item.tags }
        }).limit(5).populate("postedBy", "name");

        let matches = [];
        if(req.file && potentialMatches.length){
            const images = potentialMatches.map(i => i.image);
            try {
                const scores = await checkImageMatch(req.file.path, images);
                matches = potentialMatches.filter((item, i) => scores[i] > 0.80);
            } catch (err) {
                console.error("AI Python Server Error:", err.message);
            }
        }

        if(matches.length){
            for(const match of matches){
                await Notification.create({
                    user: match.postedBy._id,
                    type: "match",
                    title: "Potential Match Found",
                    message: `AI found a possible match for your item: ${item.title}`,
                    item: item._id
                });
            }
        }
        req.app.get("socketio").emit("new_item_posted", item);
        res.status(201).json({
            message: "Report Broadcasted!",
            item,
            aiMatches: matches
        });

    } catch (error) {
        console.error("Create Item Error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.checkPotentialMatches = async (req, res) => {
    try {
        const { title, category, type } = req.query;
        if (!title || !category || !type) return res.status(400).json({ message: "Missing params" });

        const rawText = title.toLowerCase();
        // 🛠️ FIX 1: Sirf alphanumeric words nikalo
        const words = rawText.split(/\W+/).filter(Boolean);
        
        // 🛠️ FIX 2: 'uv' match karne ke liye length >= 2 rakhi hai
        const stopWords = ['lost', 'found', 'this', 'that', 'with', 'from', 'near', 'some', 'item', 'have'];
        const searchTags = words.filter(w => w.length >= 2 && !stopWords.includes(w));

        // Agar koi valid tag nahi bacha, toh khali return karo (Crash nahi hoga)
        if (searchTags.length === 0) return res.json({ found: false, suggestions: [] });

        const targetType = type === "lost" ? "found" : "lost";

        // 🛠️ FIX 3: Regex pattern ko safe banao
        const regexPattern = searchTags.map(tag => tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join("|");

        const suggestions = await Item.find({
            category: category, // Same category
            type: targetType,   // Opposite type (Lost vs Found)
            status: { $ne: "returned" }, // Jo abhi tak open hain
            $or: [
                { tags: { $in: searchTags } }, 
                { title: { $regex: regexPattern, $options: "i" } },
                { description: { $regex: regexPattern, $options: "i" } } // Description bhi check karlo safer side
            ]
        })
        .limit(4)
        .select("title image location category date description");

        res.json({ 
            found: suggestions.length > 0, 
            suggestions 
        });
    } catch (error) {
        console.error("AI Match Error:", error);
        res.status(500).json({ message: "AI Engine Error" });
    }
};

// --- GET ITEMS ---
exports.getItems = async (req, res) => {
    try {
        const items = await Item.find()
            .populate("postedBy", "name")
            .sort({ createdAt: -1 });

        res.json(items);

    } catch (error) {
        res.status(500).json({ message: "Error fetching items" });
    }
};


// --- GET SINGLE ITEM ---
exports.getItemById = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id)
            .populate("postedBy", "name karmaPoints"); // Karma points bhi bhej do dashboard ke liye

        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        // --- SMART MATCH LOGIC (Optional but recommended) ---
        // Same category ke dusre items dhundo jo current item nahi hain
        const matches = await Item.find({
            category: item.category,
            _id: { $ne: item._id } 
        }).limit(3);

        // Frontend ko { item, matches } format mein bhejo
        res.json({
            item,
            matches
        });

    } catch (error) {
        console.error("GET ITEM ERROR:", error);
        res.status(500).json({ message: "Error fetching item" });
    }
};

exports.confirmHandover = async (req, res) => {
    try {
        const { itemId } = req.body; // Frontend se item ki ID aayegi

        // 1. Check karo item exist karta hai ya nahi
        const item = await Item.findById(itemId);
        if (!item) return res.status(404).json({ message: "Item not found" });

        // 2. Sirf wahi banda points de sakta hai jisne 'Lost' report kiya tha
        // aur points use milenge jisne 'Found' report kiya tha.
        if (item.status === "returned") {
            return res.status(400).json({ message: "Item already marked as returned!" });
        }

        // 3. Update Item Status
        item.status = "returned";
        await item.save();

        // 4. Award Points to the Finder
        // Agar current user (owner) confirm kar raha hai, toh 'postedBy' (finder) ko points do
        const finderId = item.postedBy; 
        
        const updatedFinder = await User.findByIdAndUpdate(
            finderId,
            { $inc: { karmaPoints: 100 } }, // Return karne par zyada points (100)
            { new: true }
        );

        res.status(200).json({ 
            message: "Handover Confirmed! 🤝 +100 Karma awarded to Finder.",
            itemStatus: item.status,
            finderRank: updatedFinder.rank // Humne virtual rank banaya tha na? Woh yahan dikhega
        });

    } catch (error) {
        res.status(500).json({ message: "Handover failed: " + error.message });
    }
};

// controllers/itemController.js -> generateOTP replacement
exports.generateOTP = async (req, res) => {
    try {
        const { id } = req.params;
        // 6 Digit Security Key generate ho rahi hai
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

        const objectId = new mongoose.Types.ObjectId(id);

        // Update DB
        const result = await Item.collection.findOneAndUpdate(
            { _id: objectId },
            { $set: { handoverOtp: generatedOtp } },
            { returnDocument: 'after' }
        );

        if (!result) return res.status(404).json({ message: "Item not found" });

        // Debug ke liye console mein bhi dikhega
        console.log(`🔑 [SECURITY_LOG] Item: ${id} | OTP: ${generatedOtp}`);

        // ✅ FIX: OTP ko response mein bhejna padega taaki Owner dekh sake!
        res.status(200).json({ 
            message: "OTP generated successfully",
            otp: generatedOtp // <--- YE LINE MISSED THI! Iske bina frontend ko kuch nahi milega
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- VERIFY HANDOVER (ATOMIC CHECK) ---
exports.verifyHandover = async (req, res) => {
    try {
        const { itemId, inputOtp } = req.body;
        
        if (!itemId || !inputOtp) {
            return res.status(400).json({ message: "Item ID and OTP are required!" });
        }

        // 1. Item ko populate karke nikalo
        const item = await Item.findById(itemId);
        if (!item) return res.status(404).json({ message: "Item not found" });

        const dbOtp = String(item.handoverOtp || "").trim();
        const userOtp = String(inputOtp || "").trim();

        // 🛡️ OTP Validation
        if (dbOtp === userOtp && dbOtp !== "") {
            
            // 🔥 FIX 1: req.user._id save karo (ID required for populate)
            item.handoverTo = req.user._id; 
            item.handoverDate = new Date(); 
            item.status = "returned";
            item.handoverOtp = null; 
            item.isHandedOver = true;

            if (item.rewardAmount > 0) {
                item.escrowStatus = "released"; 
            }

            await item.save();

            // 🔥 FIX 2: Save karne ke baad user ka naam nikalne ke liye populate karo
            // taaki response mein Admin ko turant sahi data dikhe
            const updatedItem = await Item.findById(itemId).populate("handoverTo", "name email");

            // 2. FINDER REWARD LOGIC
            const finderId = item.postedBy;
            if (finderId) {
                await User.findByIdAndUpdate(finderId, { 
                    $inc: { 
                        karmaPoints: 100,
                        totalEarnings: item.rewardAmount || 0 
                    } 
                });
            }

            // 3. Cleanup logic
            await Item.updateMany(
                { 
                    postedBy: req.user._id, 
                    type: "lost", 
                    status: { $in: ["open", "pending"] }, 
                    category: item.category 
                },
                { $set: { status: "returned" } }
            );

            const responseMsg = item.rewardAmount > 0 
                ? `Handover Successful! Reward of ₹${item.rewardAmount} released.` 
                : "Handover Successful! Mission Accomplished.";

            // 🔥 FIX 3: Updated object bhejo
            return res.status(200).json({ 
                success: true,
                message: responseMsg,
                handoverTo: updatedItem.handoverTo // Ab isme pura object jayega {name, email}
            });
        }

        return res.status(400).json({ 
            success: false, 
            message: "Invalid Security Key!" 
        });
        
    } catch (error) {
        console.error("VERIFY ERROR:", error);
        res.status(500).json({ message: "Security error: " + error.message });
    }
};

// ... baaki saare functions (createItem, getItems, generateOTP) tere code wale hi rahenge

// --- DELETE ITEM ---
exports.deleteItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        // 🚨 SECURITY: Check karo ki wahi user delete kar raha hai jisne post ki thi
        if (item.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You can only delete your own posts" });
        }

        // Post delete karo
        await Item.findByIdAndDelete(req.params.id);

        // User ke posts array se bhi hata do
        await User.findByIdAndUpdate(req.user._id, { 
            $pull: { posts: req.params.id } 
        });

        res.json({ message: "Post deleted successfully! 🗑️" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.fetchSuggestions = async (req, res) => {
    try {

        const userId = req.user._id;

        // 1️⃣ User ke lost items
        const myLostItems = await Item.find({
            postedBy: userId,
            type: "lost",
            status: { $ne: "returned" }
        });

        if (!myLostItems.length) {
            return res.status(200).json({ suggestions: [] });
        }

        // 2️⃣ Categories + Tags collect karo
        const categories = myLostItems.map(i => i.category);
        const tags = myLostItems.flatMap(i => i.tags || []);

        // 3️⃣ Found items search
        const foundItems = await Item.find({
            type: "found",
            category: { $in: categories },
            status: { $ne: "returned" },
            postedBy: { $ne: userId }
        })
        .select("title image category location createdAt tags")
        .limit(20);

        // 4️⃣ AI scoring logic
        const scoredSuggestions = foundItems.map(item => {

            let score = 0;

            // category match
            if (categories.includes(item.category)) score += 40;

            // tag match
            const commonTags = item.tags?.filter(tag => tags.includes(tag)) || [];
            score += commonTags.length * 20;

            // recency boost
            const hoursOld = (Date.now() - new Date(item.createdAt)) / (1000*60*60);
            if (hoursOld < 24) score += 10;

            score = Math.min(score, 95);

            return {
                ...item._doc,
                aiScore: score
            };

        });

        // 5️⃣ highest score first
        const sorted = scoredSuggestions
            .sort((a,b)=>b.aiScore-a.aiScore)
            .slice(0,5);

        res.status(200).json({ suggestions: sorted });

    } catch (error) {
        console.error("Fetch Suggestions Error:", error);
        res.status(500).json({ message: "AI Engine error while fetching suggestions" });
    }
};

exports.getNearbyItems = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "Location required" });
    }

    // 1. Database se items nikalo
    const items = await Item.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: 50000 // 50km range
        }
      },
      status: { $ne: "returned" }
    })
    .limit(10)
    .select("title image location category type rewardAmount");

    // 2. 🔥 Sabse bada fix: Address ko map karke saaf karo
    const cleanedItems = items.map(item => {
      let rawAddress = item.location?.address || "Unknown";
      
      // Agar address JSON string hai toh parse karo
      if (typeof rawAddress === 'string' && rawAddress.startsWith('{')) {
        try {
          const parsed = JSON.parse(rawAddress);
          rawAddress = parsed.address || rawAddress;
        } catch (e) {
          // parse fail hua toh raw hi rehne do
        }
      }

      // 🛠️ Final Clean: Faltu ke brackets, quotes, aur "address:" word hatao
      let finalAddress = String(rawAddress)
        .replace(/[{}""[\]\\]/g, "") // Brackets aur quotes hatao
        .replace(/address[:\s]+/i, "") // "address:" word hatao
        .split(",")[0] // Sirf pehli city ka naam lo
        .trim();

      // Item object ko modify karo bina database chhede
      return {
        ...item._doc,
        location: {
          ...item.location,
          address: finalAddress || "Jaipur"
        }
      };
    });

    // 3. Cleaned items bhejo
    res.json({ items: cleanedItems });

  } catch (error) {
    console.error("Nearby error:", error);
    res.status(500).json({ message: "Nearby search failed" });
  }
};