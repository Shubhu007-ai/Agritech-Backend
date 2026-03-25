const Equipment = require("../models/Equipment");

/* ==============================
   GET ALL EQUIPMENT (Rentee)
================================= */
exports.getAllEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find().populate("ownerId", "name email");
    res.json(equipment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ==============================
   GET MY EQUIPMENT (Lessee)
================================= */
exports.getMyEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find({ ownerId: req.user.id });
    res.json(equipment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ==============================
   ADD EQUIPMENT
================================= */
exports.addEquipment = async (req, res) => {
  try {
    const { name, pricePerHour, type, location, imageUrl } = req.body;

    if (!name || !pricePerHour || !type || !location) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newEquipment = new Equipment({
      name,
      pricePerHour,
      type,
      location,
      imageUrl,
      ownerId: req.user.id,
    });

    const saved = await newEquipment.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ==============================
   UPDATE EQUIPMENT
================================= */
exports.updateEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    if (equipment.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updated = await Equipment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ==============================
   DELETE EQUIPMENT
================================= */
exports.deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    if (equipment.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await equipment.deleteOne();
    res.json({ message: "Equipment removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};