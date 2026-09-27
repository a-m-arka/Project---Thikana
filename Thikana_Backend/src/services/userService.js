import prisma from "../config/prisma.js";
import { getUserFromToken, verifyPassword, hashPassword } from "../utils/authUtils.js";
import { uploadImage, deleteImage } from "../utils/cloudinaryUtils.js";

export const getUser = async (token) => {
    const user = await getUserFromToken(token);
    if (!user) {
        return { success: false, message: "Invalid token" };
    }
    return { success: true, data: user };
};

export const updateProfilePicture = async (token, fileBuffer, fileName) => {
    try {
        const user = await getUserFromToken(token);
        if (!user) {
            return { success: false, message: "Invalid token" };
        }

        // Delete old profile picture from Cloudinary if it exists
        if (user.profile_picture_cloudinary_id) {
            const deleteResult = await deleteImage(user.profile_picture_cloudinary_id);
            if (!deleteResult.success) {
                return { success: false, message: "Error deleting old profile picture", error: deleteResult.error };
            }
        }

        // Upload new image to Cloudinary
        const uploadedImage = await uploadImage(fileBuffer, fileName);
        if (!uploadedImage.success) {
            return { success: false, message: "Error uploading new profile picture", error: uploadedImage.error };
        }

        // Update database with Prisma
        await prisma.users.update({
            where: { user_id: user.user_id },
            data: {
                profile_picture_url: uploadedImage.result.secure_url,
                profile_picture_cloudinary_id: uploadedImage.result.public_id,
            },
        });

        return { success: true, message: "Profile picture updated successfully." };
    } catch (error) {
        console.error("Error updating profile picture:", error);
        return { success: false, message: "Error updating profile picture", error };
    }
};

export const editProfile = async (token, newData) => {
    try {
        const user = await getUserFromToken(token);
        if (!user) {
            return { success: false, message: "Invalid token" };
        }

        // Check if new email is already taken by another user
        if (newData.email) {
            const existingUser = await prisma.users.findUnique({
                where: { email: newData.email },
            });
            if (existingUser && existingUser.user_id !== user.user_id) {
                return { success: false, message: "Email already exists" };
            }
        }

        // Build update payload only with provided fields
        const updateData = {};
        if (newData.name !== undefined) updateData.name = newData.name;
        if (newData.email !== undefined) updateData.email = newData.email;
        if (newData.phone !== undefined) updateData.phone_number = newData.phone;
        if (newData.address !== undefined) updateData.address = newData.address;

        await prisma.users.update({
            where: { user_id: user.user_id },
            data: updateData,
        });

        return { success: true, message: "User details updated successfully." };
    } catch (error) {
        console.error("Error updating user details:", error);
        return { success: false, message: "Error updating user details", error };
    }
};

export const changePassword = async (token, oldPassword, newPassword) => {
    try {
        const user = await getUserFromToken(token);
        if (!user) {
            return { success: false, message: "Invalid token" };
        }

        const isOldPasswordValid = await verifyPassword(oldPassword, user.password);
        if (!isOldPasswordValid) {
            return { success: false, message: "Invalid old password" };
        }

        const hashedPassword = await hashPassword(newPassword);
        await prisma.users.update({
            where: { user_id: user.user_id },
            data: { password: hashedPassword },
        });

        return { success: true, message: "Password changed successfully." };
    } catch (error) {
        console.error("Error changing password:", error);
        return { success: false, message: "Error changing password", error };
    }
};