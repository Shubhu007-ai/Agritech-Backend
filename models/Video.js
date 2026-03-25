const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
    {
        title: String,
        description: String,
        videoUrl: String,
        category: {
            type: String,
            enum: ["Crop", "Dairy", "Organic", "Irrigation", "Harvesting"],
            required: true
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        views: {
            type: Number,
            default: 0
        },

        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        status: {
            type: String,
            enum: ["approved", "rejected"],
            default: "approved"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Video", videoSchema);
