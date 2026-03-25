const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
  getAllEquipment,
  getMyEquipment,
  addEquipment,
  updateEquipment,
  deleteEquipment,
} = require("../controllers/equipmentController");

/* Rentee - Public */
router.get("/", getAllEquipment);

/* Lessee - Protected */
router.get("/my-equipment", auth, getMyEquipment);
router.post("/", auth, addEquipment);
router.put("/:id", auth, updateEquipment);
router.delete("/:id", auth, deleteEquipment);

module.exports = router;