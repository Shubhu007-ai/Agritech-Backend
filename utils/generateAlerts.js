const InventoryItem = require("../models/InventoryItem");
const Machinery = require("../models/Machinery");
const Alert = require("../models/Alert");

// AUTO ALERT GENERATION LOGIC
const generateAlerts = async () => {
  try {
    // Clear old alerts (optional but keeps alerts fresh)
    await Alert.deleteMany();

    const newAlerts = [];

    /* ===============================
       CHECK INVENTORY STOCK LEVELS
    =============================== */
    const inventoryItems = await InventoryItem.find();

    inventoryItems.forEach((item) => {
      if (item.status === "low") {
        newAlerts.push({
          message: `${item.name} is low on stock.`,
          type: "warning",
        });
      }

      if (item.status === "critical") {
        newAlerts.push({
          message: `${item.name} is critically low!`,
          type: "danger",
        });
      }
    });

    /* ===============================
       CHECK MACHINERY STATUS
    =============================== */
    const machines = await Machinery.find();

    machines.forEach((machine) => {
      if (machine.status === "In Service") {
        newAlerts.push({
          message: `${machine.name} is currently under service.`,
          type: "warning",
        });
      }

      if (machine.utilization >= 90) {
        newAlerts.push({
          message: `${machine.name} is overused (${machine.utilization}%). Schedule maintenance.`,
          type: "danger",
        });
      }
    });

    /* ===============================
       SAVE NEW ALERTS
    =============================== */
    if (newAlerts.length > 0) {
      await Alert.insertMany(newAlerts);
    }

    return newAlerts;

  } catch (error) {
    console.error("Alert Generation Error:", error);
    throw error;
  }
};

module.exports = generateAlerts;