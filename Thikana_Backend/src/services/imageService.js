import * as imageUtils from "../utils/cloudinaryUtils.js";
import * as propertyUtils from "../utils/propertyUtils.js";

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
        const ownership = await propertyUtils.getOwnedPropertyImage(public_id, userId);
        if (!ownership.success) {
            throw new Error(ownership.message);
        }
        if (!ownership.image) {
            const error = new Error("You do not own this image");
            error.statusCode = 403;
            throw error;
        }

        const cloudinaryResult = await imageUtils.deleteImage(public_id);
        if (!cloudinaryResult.success) {
            throw new Error("Error deleting image from Cloudinary");
        }

        const databaseResult = await propertyUtils.deletePropertyImage(public_id);
        if (!databaseResult.success) {
            throw new Error(databaseResult.message);
        }

        return { success: true, result: cloudinaryResult.result };
    } catch (error) {
        if (error.statusCode) {
            throw error;
        }
        throw new Error(error.message || "Error deleting image");
    }
};