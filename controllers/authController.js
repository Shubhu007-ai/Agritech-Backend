const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* ============================================
   REGISTER
============================================ */
const register = async (req, res) => {
  try {
    const { name, phone, email, password, role } = req.body;

    if (!name || !phone || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (phone.length !== 10) {
      return res.status(400).json({
        message: "Phone number must be 10 digits"
      });
    }

    const existingUser = await User.findOne({ phone });

    if (existingUser) {
      return res.status(400).json({
        message: "Phone already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({
      name,
      phone,
      email,
      password: hashedPassword,
      role: role || "farmer",

      otp,
      otpExpire: Date.now() + 2 * 60 * 1000,

      resendCount: 0,
      nextOtpRequest: Date.now() + 5 * 60 * 1000
    });

    await sendEmail(
      email,
      "Verify your email",
      `<h3>Your OTP is ${otp}</h3>
       <p>This OTP expires in 2 minutes.</p>`
    );

    res.json({
      message: "User registered. OTP sent",
      resendAfter: user.nextOtpRequest
    });

  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Registration failed! Email already existed." });
  }
};

/* ============================================
   RESEND OTP
============================================ */
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (Date.now() < user.nextOtpRequest) {
      return res.status(400).json({
        message: "Please wait before requesting OTP again",
        resendAfter: user.nextOtpRequest
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpire = Date.now() + 2 * 60 * 1000;

    user.resendCount += 1;

    const delay = (5 + user.resendCount * 5) * 60 * 1000;
    user.nextOtpRequest = Date.now() + delay;

    await user.save();

    await sendEmail(
      email,
      "New OTP",
      `<h3>Your new OTP is ${otp}</h3>
       <p>This OTP expires in 2 minutes.</p>`
    );

    res.json({
      message: "OTP resent",
      resendAfter: user.nextOtpRequest
    });

  } catch (err) {
    console.error("Resend OTP Error:", err);
    res.status(500).json({ message: "Failed to resend OTP" });
  }
};

/* ============================================
   VERIFY OTP
============================================ */
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp !== otp || user.otpExpire < Date.now()) {
      return res.status(400).json({
        message: "Invalid or expired OTP"
      });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpire = null;

    await user.save();

    res.json({ message: "Email verified successfully" });

  } catch (err) {
    console.error("Verify OTP Error:", err);
    res.status(500).json({ message: "OTP verification failed" });
  }
};

/* ============================================
   LOGIN
============================================ */
const login = async (req, res) => {
  try {

    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    /* Detect email or phone */
    const isEmail = identifier.includes("@");

    const user = await User.findOne(
      isEmail ? { email: identifier } : { phone: identifier }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        message: "Please verify your email first"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Incorrect password"
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "90d" }
    );

    res.json({ token, user });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

/* ============================================
   FORGOT PASSWORD
============================================ */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetToken = otp;
    user.resetExpire = Date.now() + 2 * 60 * 1000;

    await user.save();

    await sendEmail(
      email,
      "Password Reset OTP",
      `<h2>Your OTP is ${otp}</h2>
       <p>This OTP expires in 2 minutes</p>`
    );

    res.json({ message: "Reset OTP sent" });

  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: "Failed to send reset OTP" });
  }
};

const setPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.hasPassword = true;

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "90d" }
    );

    res.json({ token, user });

  } catch (err) {
    console.error("Set Password Error:", err);
    res.status(500).json({ message: "Failed to set password" });
  }
};

/* ============================================
   RESET PASSWORD (FIXED FINAL)
============================================ */
const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    const user = await User.findOne({ email });

    console.log("RESET DATA:", email, otp);
    console.log("DB TOKEN:", user?.resetToken);
    console.log("DB EXPIRE:", user?.resetExpire);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (
      user.resetToken !== otp ||
      user.resetExpire < Date.now()
    ) {
      return res.status(400).json({
        message: "Invalid or expired OTP"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetToken = null;
    user.resetExpire = null;

    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Password reset failed" });
  }
};

/* ============================================
   GOOGLE LOGIN
============================================ */
const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, sub } = payload;

    let user = await User.findOne({ email });

    /* =========================
       FIRST TIME USER
    ========================= */
    if (!user) {
      user = await User.create({
        name,
        email,
        phone: `google_${Date.now()}`,
       password: await bcrypt.hash(Math.random().toString(), 10),
        googleId: sub,
        isVerified: true,
        hasPassword: false
      });

      return res.json({
        needPasswordSetup: true,
        email: user.email
      });
    }

    /* =========================
       USER EXISTS BUT NO PASSWORD
    ========================= */
    if (!user.hasPassword) {
      return res.json({
        needPasswordSetup: true,
        email: user.email
      });
    }

    /* =========================
       NORMAL LOGIN
    ========================= */
    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "90d" }
    );

    res.json({
      token: jwtToken,
      user
    });

  } catch (err) {
    console.error("Google Login Error:", err);
    res.status(500).json({ message: "Google login failed" });
  }
};

module.exports = {
  register,
  resendOtp,
  verifyOtp,
  login,
  forgotPassword,
  resetPassword,
  googleLogin,
  setPassword
};