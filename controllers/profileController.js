const User = require("../models/User");
const Video = require("../models/Video");

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  const videos = await Video.find({ uploadedBy: req.params.id });

  res.json({ user, videos });
};

exports.toggleBookmark = async (req, res) => {
  const user = await User.findById(req.user.id);

  const exists = user.bookmarks.includes(req.params.videoId);

  if (exists) {
    user.bookmarks.pull(req.params.videoId);
  } else {
    user.bookmarks.push(req.params.videoId);
  }

  await user.save();

  res.json({ bookmarks: user.bookmarks });
};
