const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video"
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    text: String,

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    isPinned: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
