const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const filter = require("../middleware/contentFilterMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  uploadVideo,
  getAllVideos,
  likeVideo,
  deleteVideo,
  incrementViews
} = require("../controllers/videoController");


router.post("/upload", auth, upload.single("video"), filter, uploadVideo);
router.get("/", getAllVideos);
router.put("/like/:id", auth, likeVideo);
router.delete("/:id", auth, role("admin"), deleteVideo);
router.put("/view/:id", incrementViews);


module.exports = router;
