import { pool } from "../config/db.js";
import messageQueries from "../queries/messageQueries.js";

const normalizeId = (value) => Number.parseInt(value, 10);

export const createMessage = async (
  senderId,
  { receiverId, postId = null, text },
) => {
  const receiver = normalizeId(receiverId);
  const post = postId ? normalizeId(postId) : null;
  const messageText = typeof text === "string" ? text.trim() : "";

  if (!Number.isInteger(receiver) || receiver < 1)
    throw new Error("A valid recipient is required");
  if (receiver === senderId) throw new Error("You cannot message yourself");
  if (!messageText || messageText.length > 5000)
    throw new Error("Message must be between 1 and 5000 characters");
  if (postId && (!Number.isInteger(post) || post < 1))
    throw new Error("Invalid post");

  const [result] = await pool.query(messageQueries.createMessage, [
    senderId,
    receiver,
    post,
    messageText,
  ]);
  const [rows] = await pool.query(messageQueries.getMessageById, [
    result.insertId,
  ]);
  return rows[0];
};

export const getConversations = async (userId) => {
  const [rows] = await pool.query(messageQueries.getConversations, [
    userId,
    userId,
    userId,
    userId,
    userId,
    userId,
  ]);
  return rows;
};

export const markMessageDelivered = async (messageId) => {
  await pool.query(messageQueries.markMessageDelivered, [messageId]);
  const [rows] = await pool.query(messageQueries.getMessageById, [messageId]);
  return rows[0];
};

export const getConversation = async (
  userId,
  otherUserId,
  before,
  limit = 50,
) => {
  const otherId = normalizeId(otherUserId);
  if (!Number.isInteger(otherId) || otherId < 1 || otherId === userId) {
    throw new Error("A valid conversation participant is required");
  }
  const safeLimit = Math.min(100, Math.max(1, normalizeId(limit) || 50));
  const cursor = before ? normalizeId(before) : null;
  if (before && (!Number.isInteger(cursor) || cursor < 1)) {
    throw new Error("Invalid message cursor");
  }

  const query = cursor
    ? messageQueries.getConversationBefore
    : messageQueries.getLatestConversation;
  const values = [userId, otherId, otherId, userId];
  if (cursor) values.push(cursor);
  values.push(safeLimit + 1);

  const [rows] = await pool.query(query, values);
  const hasMore = rows.length > safeLimit;
  const messages = rows.slice(0, safeLimit).reverse();
  await pool.query(messageQueries.markConversationRead, [otherId, userId]);

  return {
    messages,
    pagination: {
      hasMore,
      nextCursor: hasMore ? messages[0]?.message_id || null : null,
    },
  };
};

export const markConversationRead = async (userId, otherUserId) => {
  const otherId = normalizeId(otherUserId);
  if (!Number.isInteger(otherId) || otherId < 1)
    throw new Error("A valid conversation participant is required");
  await pool.query(messageQueries.markConversationRead, [otherId, userId]);
};
