const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },

    phone: {
      type: String,
      required: true,
      unique: true
    },

    email: {
      type: String,
      unique: true,
      sparse: true
    },

    password: { 
      type: String, 
      required: true 
    },

    location: String,

    role: {
      type: String,
      enum: ["farmer", "admin"],
      default: "farmer"
    },

    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
      }
    ],

    bio: String,

    profileImage: String,

    /* =============================
       EMAIL VERIFICATION
    ============================= */

    isVerified: {
      type: Boolean,
      default: false
    },

    otp: String,

    otpExpire: Date,

    /* =============================
       OTP RESEND CONTROL
    ============================= */

    resendCount: {
      type: Number,
      default: 0
    },

    nextOtpRequest: {
      type: Date,
      default: null
    },

    /* =============================
       PASSWORD RESET
    ============================= */

    resetToken: String,

    resetExpire: Date,

    /* =============================
       GOOGLE LOGIN
    ============================= */

    googleId: {
      type: String,
      default: null
    },

    hasPassword: {
  type: Boolean,
  default: true
}
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);