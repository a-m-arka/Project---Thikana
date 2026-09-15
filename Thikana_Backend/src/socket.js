import { verifyToken } from "./utils/authUtils.js";
import {
  createMessage,
  markConversationRead,
  markMessageDelivered,
} from "./services/messageService.js";

const userRoom = (userId) => `user:${userId}`;

export default function configureSocketServer(io) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));
      socket.user = verifyToken(token);
      return next();
    } catch {
      return next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id;
    socket.join(userRoom(userId));

    socket.on("message:send", async (payload, acknowledgement = () => {}) => {
      try {
        let message = await createMessage(userId, payload || {});
        const recipientSockets = await io
          .in(userRoom(message.receiver_id))
          .fetchSockets();

        if (recipientSockets.length) {
          message = await markMessageDelivered(message.message_id);
        }

        io.to(userRoom(message.sender_id))
          .to(userRoom(message.receiver_id))
          .emit("message:new", message);
        acknowledgement({ ok: true, data: message });
      } catch (error) {
        acknowledgement({
          ok: false,
          message: error.message || "Unable to send message",
        });
      }
    });

    socket.on(
      "message:read",
      async ({ otherUserId } = {}, acknowledgement = () => {}) => {
        try {
          await markConversationRead(userId, otherUserId);
          io.to(userRoom(otherUserId)).emit("message:read", {
            readerId: userId,
          });
          acknowledgement({ ok: true });
        } catch (error) {
          acknowledgement({
            ok: false,
            message: error.message || "Unable to update message status",
          });
        }
      },
    );
  });
}
