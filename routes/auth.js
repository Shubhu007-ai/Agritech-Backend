const router = require("express").Router();

const {
  register,
  login,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  googleLogin,
  setPassword
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);

router.post("/verify-otp", verifyOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/google-login", googleLogin);
router.post("/resend-otp", resendOtp);
router.post("/set-password", setPassword);

module.exports = router;