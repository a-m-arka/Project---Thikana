import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

export const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

export const verifyPassword = async (password, hashedPassword) => {

    // console.log("Plain:", password);
    // console.log("Hashed:", hashedPassword); // Debugging: Check if this is undefined

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
