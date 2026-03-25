require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const multer = require("multer");
const FormData = require("form-data");

const connectDB = require("./config/db");

// Existing Models
const Equipment = require("./models/Equipment");
const Crop = require("./models/Crop");
const session = require("express-session");

// Connect DB
connectDB();

const app = express();

/* ======================================
   MIDDLEWARE
====================================== */

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(session({
  secret: "agritech_secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    sameSite: "none"
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// // Debug incoming requests
// app.use((req, res, next) => {
//   next();
// });

/* ======================================
   IMPORT ROUTES (Existing)
====================================== */
const authRoute = require("./routes/auth");
const soilRoute = require("./routes/soil");

const videoRoutes = require("./routes/videoRoutes");
const commentRoutes = require("./routes/commentRoutes");
const profileRoutes = require("./routes/profileRoutes");
const equipmentRoutes = require("./routes/equipmentRoutes");

/* ======================================
   USE ROUTES (Existing)
====================================== */
app.use("/api/auth", authRoute);
app.use("/api/soil", soilRoute);

app.use("/api/videos", videoRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/equipment", equipmentRoutes);

/* ======================================
   WEATHER & AQI
====================================== */
app.get("/api/weather", async (req, res) => {
  try {
    const apiKey = process.env.WEATHER_API_KEY;
    const city = req.query.city;
    const lat = req.query.lat;
    const lon = req.query.lon;

    let weatherUrl = "";

    if (lat && lon) {
      weatherUrl = `${process.env.WEATHER_API_URL}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    } else {
      const cityName = city || "Delhi";
      weatherUrl = `${process.env.WEATHER_API_URL}?q=${cityName}&appid=${apiKey}&units=metric`;
    }
    const weatherRes = await axios.get(weatherUrl);

    let aqi = null;
    let pm2_5 = null;

    try {
      const { lat, lon } = weatherRes.data.coord;

      const aqiUrl = `${process.env.WEATHER_AQI_URL}?lat=${lat}&lon=${lon}&appid=${apiKey}`;
      const aqiRes = await axios.get(aqiUrl);

      aqi = aqiRes.data.list[0].main.aqi;
      pm2_5 = aqiRes.data.list[0].components.pm2_5;
    } catch (err) {
      console.log("AQI not available");
    }

    const combinedData = {
      ...weatherRes.data,
      aqi,
      pm2_5,
    };

    res.json(combinedData);
  } catch (error) {
    console.error("Weather/AQI Error:", error.message);
    res.status(500).json({ message: "Weather data unavailable" });
  }
});

/* ======================================
   WEATHER FORECAST
====================================== */

app.get("/api/weather-forecast", async (req, res) => {
  try {
    const apiKey = process.env.WEATHER_API_KEY;
    const city = req.query.city || "Delhi";

    const url = `${process.env.WEATHER_FORECAST_URL}?q=${city}&appid=${apiKey}&units=metric`;
    const response = await axios.get(url);

    const dailyData = response.data.list.filter((reading) =>
      reading.dt_txt.includes("12:00:00"),
    );

    res.json(dailyData);
  } catch (error) {
    res.status(500).json({ message: "Forecast unavailable" });
  }
});

/* ======================================
   MARKET PRICES
====================================== */

app.get("/api/market-prices", async (req, res) => {
  try {
    const apiKey = process.env.MARKET_API_KEY;
    const resourceId = process.env.MARKET_RESOURCE_ID;

    const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=50`;
    const response = await axios.get(url);

    res.json(response.data.records);
  } catch (error) {
    console.error("Market API Error:", error.message);
    res.status(500).json({ message: "Failed to fetch market data" });
  }
});

/* ======================================
   CROPS
====================================== */

app.get("/api/crops", async (req, res) => {
  try {
    const crops = await Crop.find();
    res.json(crops);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/crops", async (req, res) => {
  try {
    const newCrop = new Crop(req.body);
    const savedCrop = await newCrop.save();
    res.status(201).json(savedCrop);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* ======================================
   PREDICT (Multer)
====================================== */

const upload = multer();

app.post("/predict", upload.single("file"), async (req, res) => {
  try {
    const formData = new FormData();
    formData.append("file", req.file.buffer, req.file.originalname);

    const response = await axios.post(
      process.env.PLANT_DISEASE_API_URL,
      formData,
      { headers: formData.getHeaders() },
    );

    res.json(response.data);
  } catch (error) {
    console.error("Python API Error:", error.message);
    res.status(500).json({ error: "Prediction failed" });
  }
});

/* ======================================
   WEATHER ALERT (Python API)
====================================== */

app.get("/api/weather-alert", async (req, res) => {
  try {
    const city = req.query.city || "Delhi";

    const pythonUrl = `${process.env.WEATHER_ALERTS_URL}?city=${city}`;
    const response = await axios.get(pythonUrl);

    const pythonAlert = response.data.alert;

    if (!pythonAlert || pythonAlert.trim() === "") {
      return res.json({
        alert: "No weather alert currently. Conditions look normal.",
        source: "static",
      });
    }

    return res.json({
      alert: pythonAlert,
      source: "python",
    });
  } catch (err) {
    console.error("Weather Alert API Error:", err.message);

    return res.json({
      alert: "Unable to fetch alert right now. Showing default alert.",
      source: "static",
    });
  }
});

/* ======================================
   CITY SUGGESTIONS
====================================== */

app.get("/api/city-suggestions", async (req, res) => {
  try {
    const apiKey = process.env.WEATHER_API_KEY;
    const query = req.query.q;

    const url = `${process.env.CITY_SUGGESTION_API_URL}?q=${query},IN&limit=5&appid=${apiKey}`;
    const response = await axios.get(url);

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch suggestions" });
  }
});

/* ======================================
   GLOBAL ERROR HANDLER
====================================== */

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err.message || err);
  res.status(500).json({ message: "Something went wrong!" });
});

/* ======================================
   START SERVER
====================================== */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
