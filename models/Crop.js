const mongoose = require('mongoose');

const CropSchema = new mongoose.Schema({
  name: String,        // e.g., "Organic Tomatoes"
  type: String,        // e.g., Vegetable, Fruit, Grain
  pricePerKg: Number,  // e.g., 40
  quantity: Number,    // e.g., 100 (kg available)
  location: String,    // e.g., "Nasik, MH"
  imageUrl: String,    // Photo of the produce
  sellerName: String   // Farmer's name
});

module.exports = mongoose.model('Crop', CropSchema);