import express from "express";
import upload from "../config/multer.js";
import * as postController from "../controllers/postController.js";
import authenticateToken from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-post/:propertyId", authenticateToken, postController.createPost);
router.delete("/delete-post/:postId", authenticateToken, postController.deletePost);
router.get("/posts", postController.getPublishedPosts);

export default router;
