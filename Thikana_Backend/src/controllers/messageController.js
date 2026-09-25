import { verifyToken } from "../utils/authUtils.js";
import * as messageService from "../services/messageService.js";

const getUserId = (req) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) throw new Error("Token not found");
  return verifyToken(token).id;
};

const respondError = (res, error) => {
  const status =
    error.message === "Token not found" ||
    error.name === "JsonWebTokenError" ||
    error.name === "TokenExpiredError"
      ? 401
      : 400;
  return res
    .status(status)
    .json({ message: error.message || "Message request failed" });
};

export const listConversations = async (req, res) => {
  try {
    const conversations = await messageService.getConversations(getUserId(req));
    return res.json({ data: conversations });
  } catch (error) {
    return respondError(res, error);
  }
};

export const getConversation = async (req, res) => {
  try {
    const conversation = await messageService.getConversation(
      getUserId(req),
      req.params.otherUserId,
      req.query.before,
      req.query.limit,
    );
    return res.json({
      data: conversation.messages,
      pagination: conversation.pagination,
    });
  } catch (error) {
    return respondError(res, error);
  }
};

export const readConversation = async (req, res) => {
  try {
    await messageService.markConversationRead(
      getUserId(req),
      req.params.otherUserId,
    );
    return res.json({ message: "Conversation marked as read" });
  } catch (error) {
    return respondError(res, error);
  }
};
