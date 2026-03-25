const Video = require("../models/Video");
const moderateContent = require("../utils/aiModeration");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");


exports.uploadVideo = async (req, res) => {
  try {
    console.log("REQ.USER:", req.user);
    const { title, description, category } = req.body;

    if (!req.file) {
      return res.status(400).json({
        message: "Video file is required."
      });
    }

    const formData = new FormData();
    formData.append("file", fs.createReadStream(req.file.path));
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);

    const moderationResponse = await axios.post(
      process.env.VIDEO_MODERATION_API_URL,
      formData,
      {
        headers: {
          ...formData.getHeaders()
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    console.log("Moderation Response:", moderationResponse.data);


    const result = moderationResponse.data?.status;

    if (!result || result.toLowerCase() !== "approved") {

      fs.unlinkSync(req.file.path);

      return res.status(400).json({
        message:
          "This video is not related to agriculture or farming. Please upload relevant content."
      });
    }

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
