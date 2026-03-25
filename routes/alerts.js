import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/get-alert", async (req, res) => {
  const { city } = req.query;

  try {
    const pythonUrl = `${process.env.WEATHER_ALERTS_URL}?city=${city}`;
    const response = await axios.get(pythonUrl);

    const pythonAlert = response.data.alert;

    if (!pythonAlert || pythonAlert.trim() === "") {
      return res.json({
        alert: "No weather alert right now. Everything looks normal.",
        source: "static"
      });
    }

    return res.json({
      alert: pythonAlert,
      source: "python"
    });

  } catch (error) {
    return res.json({
      alert: "Unable to fetch alert right now. Showing default notice.",
      source: "static"
    });
  }
});

export default router;