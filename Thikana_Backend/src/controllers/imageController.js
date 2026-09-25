import * as imageService from "../services/imageService.js";

export const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const fileBuffer = req.file.buffer;
        const fileName = `uploads/${Date.now()}-${req.file.originalname}`;

        const result = await imageService.uploadImage(fileBuffer, fileName);

        res.status(200).json({ message: "Image uploaded successfully", url: result.secure_url, publicId: result.public_id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const uploadMultipleImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No files uploaded" });
        }

        const result = await imageService.uploadMultipleImages(req.files);

        res.status(200).json({ message: "Images uploaded successfully", uploadedImages: result.results });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteImage = async (req, res) => {
    try {
        const { publicId } = req.body;
        if (!publicId) {
            return res.status(400).json({ message: "Public ID is required" });
        }

        if (!req.user?.id) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const result = await imageService.deleteImage(publicId, req.user.id);

        res.status(200).json({ message: "Image deleted successfully", result });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};