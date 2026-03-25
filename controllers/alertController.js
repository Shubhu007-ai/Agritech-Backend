const Alert = require("../models/Alert");

// GET ALL ALERTS
const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
};

// ADD ALERT (Protected)
const addAlert = async (req, res) => {
  try {
    const newAlert = new Alert(req.body);
    await newAlert.save();
    res.json(newAlert);
  } catch (error) {
    res.status(500).json({ error: "Failed to add alert" });
  }
};

// UPDATE ALERT (Protected)
const updateAlert = async (req, res) => {
  try {
    const updated = await Alert.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update alert" });
  }
};

// DELETE ALERT (Protected)
const deleteAlert = async (req, res) => {
  try {
    await Alert.findByIdAndDelete(req.params.id);
    res.json({ message: "Alert deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete alert" });
  }
};

module.exports = {
  getAlerts,
  addAlert,
  updateAlert,
  deleteAlert,
};