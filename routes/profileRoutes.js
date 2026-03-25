const router = require("express").Router();
const auth = require("../middleware/authMiddleware");

const {
  getProfile,
  toggleBookmark
} = require("../controllers/profileController");

router.get("/:id", getProfile);
router.put("/bookmark/:videoId", auth, toggleBookmark);

module.exports = router;
