const router = require('express').Router();
const SoilReport = require('../models/SoilReport');
// const { explainSoil } = require("../controllers/soilController");

// 1. POST: Save Report
router.post('/save-report', async (req, res) => {
    try {
        const { userId, nutrients, status } = req.body;

        const newReport = new SoilReport({
            user: userId,
            nutrients,
            status
        });

        const savedReport = await newReport.save();
        res.status(200).json(savedReport);
    } catch (err) {
        console.error("Save Error:", err);
        res.status(500).json(err);
    }
});

// 2. GET: Fetch History
router.get('/history/:userId', async (req, res) => {
    try {
        const reports = await SoilReport.find({ user: req.params.userId }).sort({ createdAt: -1 });
        res.status(200).json(reports);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
