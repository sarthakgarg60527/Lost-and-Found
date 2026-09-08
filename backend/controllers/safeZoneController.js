exports.getNearbySafeZones = async (req, res) => {
    try {
        const { lat, lng } = req.query;

        // 🛑 Validation: Agar lat/lng nahi mile toh error bhej do
        if (!lat || !lng) {
            // Agar location nahi hai toh saare zones dikha do default
            const allZones = await SafeZone.find().limit(10);
            return res.json(allZones);
        }

        const zones = await SafeZone.find({
            location: {
                $near: {
                    $geometry: { 
                        type: "Point", 
                        coordinates: [parseFloat(lng), parseFloat(lat)] 
                    },
                    $maxDistance: 5000 // 5 KM
                }
            }
        }).limit(10);

        res.json(zones);
    } catch (error) {
        // 🚨 Yahan console check karo terminal mein
        console.error("Query Error:", error.message);
        res.status(500).json({ message: "Safe zones fetch error", error: error.message });
    }
};

exports.addSafeZone = async (req, res) => {
    try {
        const { name, type, lat, lng, address } = req.body;
        
        // Validation for numbers
        if (isNaN(lat) || isNaN(lng)) {
            return res.status(400).json({ message: "Invalid Coordinates" });
        }

        const newZone = await SafeZone.create({
            name, 
            type, 
            address,
            location: { 
                type: "Point", // 👈 'type' add karna zaroori hai
                coordinates: [parseFloat(lng), parseFloat(lat)] 
            }
        });
        res.status(201).json(newZone);
    } catch (err) {
        res.status(500).json({ message: "Add failed", error: err.message });
    }
};