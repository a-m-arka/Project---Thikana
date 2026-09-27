import prisma from "../config/prisma.js";
import { hashPassword, verifyPassword, generateToken } from "../utils/authUtils.js";

export const registerUser = async (user) => {
    try {
        const { username, email, phone, password } = user;

        // 1. Check if user already exists
        const existingUser = await prisma.users.findUnique({
            where: { email },
        });

        if (existingUser) {
            return { success: false, message: "User already exists" };
        }

        // 2. Hash password and save new user
        const hashedPassword = await hashPassword(password);
        await prisma.users.create({
            data: {
                name: username,
                email,
                phone_number: phone,
                password: hashedPassword,
            },
        });

        return { success: true, message: "User registered successfully" };
    } catch (error) {
        console.error("Error during registerUser:", error);
        return { success: false, message: "Registration failed. Please try again" };
    }
};

export const loginUser = async (email, password) => {
    try {
        // 1. Find user by unique email
        const user = await prisma.users.findUnique({
            where: { email },
        });

        if (!user) {
            return { success: false, message: "User not found" };
        }

        // 2. Validate password
        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) {
            return { success: false, message: "Invalid password" };
        }

        // 3. Generate JWT token
        const token = generateToken(user);
        return { success: true, message: "Login successful", token };
    } catch (error) {
        console.error("Error during loginUser:", error);
        return { success: false, message: "Login failed. Please try again" };
    }
};