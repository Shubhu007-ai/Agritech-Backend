const Video = require("../models/Video");
const moderateContent = require("../utils/aiModeration");
const axios = require("axios");


exports.uploadVideo = async (req, res) => {
  try {
    console.log("REQ.USER:", req.user);
    const { title, description, category } = req.body;

    if (!req.file) {
      return res.status(400).json({
        message: "Video file is required."
      });
    }

    // ✅ Cloudinary URL (NOT local path)
    const videoUrl = req.file.path;

    // ⚠️ If your moderation API NEEDS file stream:
    // You CANNOT use fs anymore → use URL instead

    const moderationResponse = await axios.post(
      process.env.VIDEO_MODERATION_API_URL,
      {
        videoUrl, // ✅ send URL instead of file
        title,
        description,
        category
      }
    );

    console.log("Moderation Response:", moderationResponse.data);

    const result = moderationResponse.data?.status;

    if (!result || result.toLowerCase() !== "approved") {
      return res.status(400).json({
        message:
          "This video is not related to agriculture or farming. Please upload relevant content."
      });
    }

    // ✅ Save Cloudinary URL in DB
    const video = await Video.create({
      title,
      description,
      category,
      videoUrl: videoUrl,
      uploadedBy: req.user.id
    });

    res.status(200).json(video);

  } catch (error) {
    console.error("Moderation Error:", error.response?.data || error.message);

    res.status(500).json({
      message: "Video moderation failed. Please try again."
    });
  }
};

    const video = await Video.create({
      title,
      description,
      category,
      videoUrl: `/uploads/${req.file.filename}`,
      uploadedBy: req.user.id
    });

    res.json(video);

  } catch (error) {
    console.error("Moderation Error:", error.response?.data || error.message);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      message: "Video moderation failed. Please try again."
    });
  }
};




exports.incrementViews = async (req, res) => {
  const video = await Video.findById(req.params.id);
  video.views += 1;
  await video.save();
  res.json({ views: video.views });
};


exports.getAllVideos = async (req, res) => {
  const videos = await Video.find({ status: "approved" })
    .populate("uploadedBy", "name _id")
    .sort({ createdAt: -1 });

  res.json(videos);
};

exports.likeVideo = async (req, res) => {
  const video = await Video.findById(req.params.id);

  const alreadyLiked = video.likes.includes(req.user.id);

  if (alreadyLiked) {
    video.likes.pull(req.user.id);
  } else {
    video.likes.push(req.user.id);
  }

  await video.save();

  res.json({ likes: video.likes.length });
};

exports.deleteVideo = async (req, res) => {
  await Video.findByIdAndDelete(req.params.id);
  res.json({ message: "Video deleted" });
};
