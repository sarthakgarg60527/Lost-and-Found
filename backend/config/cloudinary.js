const cloudinary = require("cloudinary").v2;

console.log("==== CLOUDINARY DEBUG START ====");
console.log("CLOUD_NAME:", process.env.CLOUD_NAME);
console.log("API_KEY:", process.env.CLOUD_API_KEY);
console.log("API_SECRET:", process.env.CLOUD_API_SECRET ? "✅ PRESENT" : "❌ MISSING");
console.log("==== CLOUDINARY DEBUG END ====");

cloudinary.config({
  cloud_name: (process.env.CLOUD_NAME || "").trim(),
  api_key: (process.env.CLOUD_API_KEY || "").trim(),
  api_secret: (process.env.CLOUD_API_SECRET || "").trim(),
  secure: true
});

module.exports = cloudinary;