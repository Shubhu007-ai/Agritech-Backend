const mongoose = require('mongoose');

const SoilReportSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Added required: true
    nutrients: {
        nitrogen: Number,
        phosphorus: Number,
        potassium: Number,
        carbon: Number,
        ph: Number
    },
    status: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SoilReport', SoilReportSchema);