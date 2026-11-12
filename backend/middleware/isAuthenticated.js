import jwt from "jsonwebtoken"
import user from "../models/userModel.js"

export const isAuthenticated = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization 
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: "Authorization token is missing or invalid"
            })
        }
        const token = authHeader.split(" ")[1]
        let decoded
        try {
            decoded = jwt.verify(token, process.env.SECRET_KEY)
        } catch (error) {
            if (error.name === "TokenExpiredError")
                return res.status(401).json({
                    success: false,
                    message: "Your session has expired. Please log in again."
                })
            return res.status(401).json({
                success: false,
                message: 'Access token is missing or invalid'
            })
        }
        const User = await user.findById(decoded.id)
        if (!User) {
            return res.status(401).json({
                success: false,
                message: "User not found or account no longer exists"
            })
        }
        req.user = User
        req.id = User._id
        next()
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const isAdmin = async (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next()
    } else {
        return res.status(403).json({
            message: "Access denied: admins only"
        });
    }
}
