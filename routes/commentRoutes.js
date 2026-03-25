const router = require("express").Router();
const auth = require("../middleware/authMiddleware");

const {
  addComment,
  getComments,
  deleteComment,
  toggleLike,
  pinComment
} = require("../controllers/commentController");

router.post("/", auth, addComment);
router.get("/:videoId", getComments);

router.delete("/:id", auth, deleteComment);
router.put("/like/:id", auth, toggleLike);
router.put("/pin/:id", auth, pinComment);

module.exports = router;
