const mongoose = require('mongoose');

const safeZoneSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['Police Station', 'Metro Station', 'Mall', 'Verified Shop'], required: true },
    address: { type: String },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], required: true } // [longitude, latitude]
    },
    isOfficial: { type: Boolean, default: true }
}, { timestamps: true });

// 🚀 Ye index lagana zaroori hai location search fast karne ke liye
safeZoneSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('SafeZone', safeZoneSchema);