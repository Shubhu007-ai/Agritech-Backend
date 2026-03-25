const Comment = require("../models/Comment");

/* ADD COMMENT */
exports.addComment = async (req, res) => {
  try {
    const comment = await Comment.create({
      video: req.body.videoId,
      user: req.user.id,
      text: req.body.text
    });

    const populated = await comment.populate("user", "name");

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* GET COMMENTS */
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      video: req.params.videoId
    })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* DELETE COMMENT */
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment)
      return res.status(404).json({ message: "Comment not found" });

    if (comment.user.toString() !== req.user.id)
      return res.status(403).json({ message: "Not allowed" });

    await comment.deleteOne();

    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* LIKE COMMENT */
exports.toggleLike = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment)
      return res.status(404).json({ message: "Comment not found" });

    const userId = req.user.id;

    if (comment.likes.includes(userId)) {
      comment.likes = comment.likes.filter(
        id => id.toString() !== userId
      );
    } else {
      comment.likes.push(userId);
    }

    await comment.save();

    const updated = await comment.populate("user", "name");

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* PIN COMMENT */
exports.pinComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment)
      return res.status(404).json({ message: "Comment not found" });

    comment.isPinned = !comment.isPinned;
    await comment.save();

    const updated = await comment.populate("user", "name");

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
