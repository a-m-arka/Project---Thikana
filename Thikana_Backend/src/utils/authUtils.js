import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import prisma from "../config/prisma.js";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

export const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

export const verifyPassword = async (password, hashedPassword) => {
    if (!hashedPassword) {
        throw new Error("Password not found for user");
    }
    return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (user) => {
    return jwt.sign({ id: user.user_id, email: user.email }, JWT_SECRET, { expiresIn: "2h" });
};

export const verifyToken = (token) => {
    return jwt.verify(token.trim(), JWT_SECRET);
};

// Helper used across services to authenticate and fetch the user
export const getUserFromToken = async (token) => {
    try {
        const decodedToken = verifyToken(token);
        const user = await prisma.users.findUnique({
            where: { user_id: decodedToken.id },
        });
        return user || null;
    } catch (error) {
        console.error("Error verifying token:", error.message);
        return null;
    }
};