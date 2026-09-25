import express from "express";
import * as messageController from "../controllers/messageController.js";
import authenticateToken from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/conversations", authenticateToken, messageController.listConversations);
router.get("/conversations/:otherUserId", authenticateToken, messageController.getConversation);
router.patch(
  "/conversations/:otherUserId/read",
  authenticateToken,
  messageController.readConversation,
);

export default router;
