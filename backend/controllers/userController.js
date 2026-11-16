import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { verifyEmail } from "../emailVerify/verifyEmail.js";
import { sendOTPMail } from "../emailVerify/sendOTPMail.js";
import supabase from "../database/supabase.js";

// ─────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────
export const register = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Check existing user
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        if (existing) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const hashPassword = await bcrypt.hash(password, 8);
        const tempToken = jwt.sign({ email }, process.env.SECRET_KEY, { expiresIn: '10m' });

        const { data: newUser, error } = await supabase
            .from('users')
            .insert({
                first_name: firstName,
                last_name: lastName,
                email,
                password: hashPassword,
                token: tempToken
            })
            .select('id, first_name, last_name, email, role, is_verified, created_at, updated_at')
            .single();

        if (error) throw new Error(error.message);

        // Update token with user id
        const token = jwt.sign({ id: newUser.id }, process.env.SECRET_KEY, { expiresIn: '10m' });
        await supabase.from('users').update({ token }).eq('id', newUser.id);
        await verifyEmail(token, email);

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                _id: newUser.id,
                firstName: newUser.first_name,
                lastName: newUser.last_name,
                email: newUser.email,
                role: newUser.role,
                isVerified: newUser.is_verified,
                createdAt: newUser.created_at,
                updatedAt: newUser.updated_at
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────
// VERIFY EMAIL
// ─────────────────────────────────────────────
export const verify = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(400).json({ success: false, message: "Authorization token is missing or invalid" });
        }
        const token = authHeader.split(" ")[1];
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.SECRET_KEY);
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(400).json({ success: false, message: "The registration token has expired" });
            }
            return res.status(400).json({ success: false, message: "Token verification failed" });
        }

        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('id', decoded.id)
            .maybeSingle();

        if (!existingUser) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        await supabase
            .from('users')
            .update({ token: null, is_verified: true })
            .eq('id', decoded.id);

        return res.status(200).json({ success: true, message: "Email Verified" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────
// RE-VERIFY
// ─────────────────────────────────────────────
export const reVerify = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        if (!existingUser) {
            return res.status(200).json({ success: true, message: "If an account exists with this email, a verification link has been sent." });
        }

        const token = jwt.sign({ id: existingUser.id }, process.env.SECRET_KEY, { expiresIn: '10m' });
        await supabase.from('users').update({ token }).eq('id', existingUser.id);
        await verifyEmail(token, email);

        return res.status(200).json({ success: true, message: "Verification email sent successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .maybeSingle();

        if (!existingUser) {
            return res.status(400).json({ success: false, message: "Invalid email or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: "Invalid email or password" });
        }

        if (!existingUser.is_verified) {
            return res.status(400).json({ success: false, message: "Verify your account then login" });
        }

        const accessToken = jwt.sign({ id: existingUser.id }, process.env.SECRET_KEY, { expiresIn: '10d' });
        const refreshToken = jwt.sign({ id: existingUser.id }, process.env.SECRET_KEY, { expiresIn: '30d' });

        await supabase.from('users').update({ is_logged_in: true }).eq('id', existingUser.id);

        // Session management
        await supabase.from('sessions').delete().eq('user_id', existingUser.id);
        await supabase.from('sessions').insert({ user_id: existingUser.id });

        return res.status(200).json({
            success: true,
            message: `Welcome back, ${existingUser.first_name}`,
            user: {
                _id: existingUser.id,
                firstName: existingUser.first_name,
                lastName: existingUser.last_name,
                email: existingUser.email,
                role: existingUser.role,
                isVerified: existingUser.is_verified,
                address: existingUser.address,
                city: existingUser.city,
                zipCode: existingUser.zip_code,
                phoneNo: existingUser.phone_no,
                createdAt: existingUser.created_at,
                updatedAt: existingUser.updated_at
            },
            accessToken,
            refreshToken
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────
export const logout = async (req, res) => {
    try {
        const userId = req.id;
        await supabase.from('sessions').delete().eq('user_id', userId);
        await supabase.from('users').update({ is_logged_in: false }).eq('id', userId);
        return res.status(200).json({ success: true, message: "User logged out successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────
// FORGET PASSWORD
// ─────────────────────────────────────────────
export const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const { data: User } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        if (!User) {
            return res.status(200).json({ success: true, message: "If an account exists with this email, an OTP has been sent." });
        }

        const otp = crypto.randomInt(100000, 1000000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();

        await supabase.from('users').update({ otp, otp_expiry: otpExpiry }).eq('id', User.id);
        await sendOTPMail(otp, email);

        return res.status(200).json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────
// VERIFY OTP
// ─────────────────────────────────────────────
export const verifyOTP = async (req, res) => {
    try {
        const { otp } = req.body;
        const { email } = req.params;

        if (!otp) {
            return res.status(400).json({ success: false, message: "OTP is required" });
        }

        const { data: User } = await supabase
            .from('users')
            .select('id, otp, otp_expiry')
            .eq('email', email)
            .maybeSingle();

        if (!User) {
            return res.status(400).json({ success: false, message: "User not found" });
        }
        if (!User.otp || !User.otp_expiry) {
            return res.status(400).json({ success: false, message: "OTP is not generated or already verified" });
        }
        if (new Date(User.otp_expiry) < new Date()) {
            return res.status(400).json({ success: false, message: "OTP expired, please request a new OTP" });
        }
        if (otp !== User.otp) {
            return res.status(400).json({ success: false, message: "OTP is invalid" });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        await supabase.from('users').update({
            otp: null,
            otp_expiry: null,
            reset_password_token: resetToken,
            reset_password_token_expiry: new Date(Date.now() + 15 * 60 * 1000).toISOString()
        }).eq('id', User.id);

        return res.status(200).json({ success: true, message: "OTP verified successfully", resetToken });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────
// CHANGE PASSWORD
// ─────────────────────────────────────────────
export const changePassword = async (req, res) => {
    try {
        const { newPassword, confirmPassword, resetToken } = req.body;
        const { email } = req.params;

        const { data: User } = await supabase
            .from('users')
            .select('id, reset_password_token, reset_password_token_expiry')
            .eq('email', email)
            .maybeSingle();

        if (!User) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        if (
            !resetToken ||
            !User.reset_password_token ||
            User.reset_password_token !== resetToken ||
            !User.reset_password_token_expiry ||
            new Date(User.reset_password_token_expiry) < new Date()
        ) {
            return res.status(401).json({ success: false, message: "Unauthorized or expired reset session. Please verify OTP first." });
        }

        if (!newPassword || !confirmPassword) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ success: false, message: "Passwords do not match" });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
        }

        const hashPassword = await bcrypt.hash(newPassword, 10);
        await supabase.from('users').update({
            password: hashPassword,
            reset_password_token: null,
            reset_password_token_expiry: null
        }).eq('id', User.id);

        return res.status(200).json({ success: true, message: "Password changed successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────
// ALL USERS (Admin)
// ─────────────────────────────────────────────
export const allUser = async (_, res) => {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('id, first_name, last_name, email, role, is_verified, is_logged_in, address, city, zip_code, phone_no, created_at, updated_at');

        if (error) throw new Error(error.message);

        const mapped = users.map(u => ({
            _id: u.id,
            firstName: u.first_name,
            lastName: u.last_name,
            email: u.email,
            role: u.role,
            isVerified: u.is_verified,
            isLoggedIn: u.is_logged_in,
            address: u.address,
            city: u.city,
            zipCode: u.zip_code,
            phoneNo: u.phone_no,
            createdAt: u.created_at,
            updatedAt: u.updated_at
        }));

        return res.status(200).json({ success: true, users: mapped });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────
// GET USER BY ID
// ─────────────────────────────────────────────
export const getUserbyId = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!req.user || (req.user.role !== "admin" && req.user.id !== userId)) {
            return res.status(403).json({ success: false, message: "Access denied: you can only view your own profile" });
        }

        const { data: User, error } = await supabase
            .from('users')
            .select('id, first_name, last_name, email, role, is_verified, address, city, zip_code, phone_no, created_at, updated_at')
            .eq('id', userId)
            .maybeSingle();

        if (error || !User) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            User: {
                _id: User.id,
                firstName: User.first_name,
                lastName: User.last_name,
                email: User.email,
                role: User.role,
                isVerified: User.is_verified,
                address: User.address,
                city: User.city,
                zipCode: User.zip_code,
                phoneNo: User.phone_no,
                createdAt: User.created_at,
                updatedAt: User.updated_at
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────
// UPDATE PROFILE
// ─────────────────────────────────────────────
export const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, address, city, zipCode, phoneNo } = req.body;

        const updates = {};
        if (firstName !== undefined) updates.first_name = firstName;
        if (lastName !== undefined) updates.last_name = lastName;
        if (address !== undefined) updates.address = address;
        if (city !== undefined) updates.city = city;
        if (zipCode !== undefined) updates.zip_code = zipCode;
        if (phoneNo !== undefined) updates.phone_no = phoneNo;

        const { data: updatedUser, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', req.id)
            .select('id, first_name, last_name, email, role, is_verified, address, city, zip_code, phone_no, created_at, updated_at')
            .single();

        if (error) throw new Error(error.message);

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                _id: updatedUser.id,
                firstName: updatedUser.first_name,
                lastName: updatedUser.last_name,
                email: updatedUser.email,
                role: updatedUser.role,
                isVerified: updatedUser.is_verified,
                address: updatedUser.address,
                city: updatedUser.city,
                zipCode: updatedUser.zip_code,
                phoneNo: updatedUser.phone_no,
                createdAt: updatedUser.created_at,
                updatedAt: updatedUser.updated_at
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
