import prisma from "../config/prisma.js";

const normalizeId = (value) => Number.parseInt(value, 10);

// Common include object to populate sender, receiver, and referenced property details
const messageInclude = {
  sender: {
    select: { user_id: true, name: true, profile_picture_url: true },
  },
  receiver: {
    select: { user_id: true, name: true, profile_picture_url: true },
  },
  posts: {
    include: {
      properties: {
        include: {
          property_images: {
            take: 1,
            orderBy: { image_id: "asc" },
          },
        },
      },
    },
  },
};

// Formats Prisma result to match the exact schema expected by the frontend
const formatMessage = (m) => {
  if (!m) return null;
  const property = m.posts?.properties || null;
  const firstImage = property?.property_images?.[0]?.image_url || null;

  return {
    message_id: m.message_id,
    sender_id: m.sender_id,
    receiver_id: m.receiver_id,
    post_id: m.post_id,
    message_text: m.message_text,
    sent_at: m.sent_at,
    read_status: m.read_status,
    message_type: m.message_type,
    deleted_by_sender: m.deleted_by_sender,
    deleted_by_receiver: m.deleted_by_receiver,
    is_edited: m.is_edited,
    sender_name: m.sender?.name || null,
    receiver_name: m.receiver?.name || null,
    referenced_property_id: property?.property_id || null,
    referenced_property_title: property?.title || null,
    referenced_property_city: property?.city || null,
    referenced_property_price: property?.price || null,
    referenced_property_image: firstImage,
  };
};

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

  const created = await prisma.messages.create({
    data: {
      sender_id: senderId,
      receiver_id: receiver,
      post_id: post,
      message_text: messageText,
    },
    include: messageInclude,
  });

  return formatMessage(created);
};

export const getConversations = async (userId) => {
  // Fetch all messages involving this user, newest first
  const allMessages = await prisma.messages.findMany({
    where: {
      OR: [{ sender_id: userId }, { receiver_id: userId }],
    },
    orderBy: { message_id: "desc" },
    include: {
      sender: {
        select: { user_id: true, name: true, profile_picture_url: true },
      },
      receiver: {
        select: { user_id: true, name: true, profile_picture_url: true },
      },
    },
  });

  // Group by conversation partner to build conversation list with latest message and unread count
  const conversationsMap = new Map();

  for (const m of allMessages) {
    const isSender = m.sender_id === userId;
    const otherUser = isSender ? m.receiver : m.sender;
    if (!otherUser) continue;

    const otherId = otherUser.user_id;

    if (!conversationsMap.has(otherId)) {
      conversationsMap.set(otherId, {
        message_id: m.message_id,
        sender_id: m.sender_id,
        receiver_id: m.receiver_id,
        message_text: m.message_text,
        sent_at: m.sent_at,
        read_status: m.read_status,
        other_user_id: otherId,
        other_user_name: otherUser.name,
        other_user_profile_picture_url: otherUser.profile_picture_url,
        unread_count: 0,
      });
    }

    if (!isSender && m.read_status !== "read") {
      conversationsMap.get(otherId).unread_count += 1;
    }
  }

  return Array.from(conversationsMap.values());
};

export const markMessageDelivered = async (messageId) => {
  const id = normalizeId(messageId);

  await prisma.messages.updateMany({
    where: {
      message_id: id,
      read_status: "unread",
    },
    data: {
      read_status: "delivered",
    },
  });

  const updated = await prisma.messages.findUnique({
    where: { message_id: id },
    include: messageInclude,
  });

  return formatMessage(updated);
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

  const whereClause = {
    OR: [
      { sender_id: userId, receiver_id: otherId },
      { sender_id: otherId, receiver_id: userId },
    ],
    ...(cursor ? { message_id: { lt: cursor } } : {}),
  };

  const rows = await prisma.messages.findMany({
    where: whereClause,
    orderBy: { message_id: "desc" },
    take: safeLimit + 1,
    include: messageInclude,
  });

  const hasMore = rows.length > safeLimit;
  const messages = rows.slice(0, safeLimit).reverse().map(formatMessage);

  // Mark messages sent by the other user as read
  await prisma.messages.updateMany({
    where: {
      sender_id: otherId,
      receiver_id: userId,
      read_status: { not: "read" },
    },
    data: {
      read_status: "read",
    },
  });

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

  await prisma.messages.updateMany({
    where: {
      sender_id: otherId,
      receiver_id: userId,
      read_status: { not: "read" },
    },
    data: {
      read_status: "read",
    },
  });
};