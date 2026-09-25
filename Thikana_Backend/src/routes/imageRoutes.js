import express from "express";
import upload from "../config/multer.js";
import * as imageController from "../controllers/imageController.js";
import authenticateToken from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/upload-image", authenticateToken, upload.single("file"), imageController.uploadImage);
router.post("/upload-multiple-images", authenticateToken, upload.array("files", 10), imageController.uploadMultipleImages);
router.delete("/delete-image", authenticateToken, imageController.deleteImage);

export default router;
