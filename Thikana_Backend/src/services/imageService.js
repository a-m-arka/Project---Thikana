import prisma from "../config/prisma.js";
import * as imageUtils from "../utils/cloudinaryUtils.js";

export const uploadImage = async (fileBuffer, fileName) => {
    try {
        const result = await imageUtils.uploadImage(fileBuffer, fileName);
        return result;
    } catch (error) {
        throw new Error("Error uploading image to Cloudinary");
    }
};

export const uploadMultipleImages = async (files) => {
    try {
        const result = await imageUtils.uploadMultipleImages(files);
        return result;
    } catch (error) {
        throw new Error("Error uploading images");
    }
};

export const deleteImage = async (public_id, userId) => {
    try {
        // 1. Verify image exists and belongs to a property owned by this user
        const image = await prisma.property_images.findFirst({
            where: {
                cloudinary_public_id: public_id,
                properties: {
                    user_id: Number(userId),
                },
            },
        });

        if (!image) {
            const error = new Error("You do not own this image");
            error.statusCode = 403;
            throw error;
        }

        // 2. Delete image from Cloudinary
        const cloudinaryResult = await imageUtils.deleteImage(public_id);
        if (!cloudinaryResult.success) {
            throw new Error("Error deleting image from Cloudinary");
        }

        // 3. Delete image from database
        await prisma.property_images.deleteMany({
            where: {
                cloudinary_public_id: public_id,
            },
        });

        return { success: true, result: cloudinaryResult.result };
    } catch (error) {
        if (error.statusCode) {
            throw error;
        }
        throw new Error(error.message || "Error deleting image");
    }
};