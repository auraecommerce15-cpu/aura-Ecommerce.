import express from "express";
import {
    allUser,
    changePassword,
    forgetPassword,
    getUserbyId,
    login,
    logout,
    register,
    reVerify,
    verify,
    verifyOTP,
    updateProfile
} from "../controllers/userController.js";
import { isAdmin, isAuthenticated } from "../middleware/isAuthenticated.js";
import { createRateLimiter } from "../middleware/rateLimiter.js";

const authLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Too many authentication attempts, please try again in 15 minutes."
});

const otpLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many OTP requests, please try again in 15 minutes."
});

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/verify", verify);
router.post("/reVerify", authLimiter, reVerify);
router.post("/login", authLimiter, login);
router.post("/logout", isAuthenticated, logout);
router.post("/forget_password", otpLimiter, forgetPassword);
router.post("/verify_otp/:email", otpLimiter, verifyOTP);
router.post("/change_password/:email", authLimiter, changePassword);
router.get("/alluser", isAuthenticated, isAdmin, allUser);
router.get("/getuser/:userId", isAuthenticated, getUserbyId);
router.put("/update", isAuthenticated, updateProfile);

export default router;