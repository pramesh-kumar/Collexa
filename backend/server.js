require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const connectDB = require("./config/db");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const Message = require("./models/Message");
const { isMatched } = require("./controllers/chatController");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { path: "/api/socket.io", cors: { origin: "*" } });

// Connect DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// Health check
app.get("/", (req, res) => res.json({ message: "Collexa API running 🚀" }));

// Routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/profile", require("./routes/profileRoutes"));
app.use("/users", require("./routes/userRoutes"));
app.use("/swipe", require("./routes/swipeRoutes"));
app.use("/matches", require("./routes/matchRoutes"));
app.use("/chat", require("./routes/chatRoutes"));

// Error handler
app.use(errorHandler);

// Socket.IO
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Unauthorized"));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

const onlineUsers = new Map(); // userId -> socketId

io.on("connection", (socket) => {
  console.log(`🔌 Connected: ${socket.userId}`);
  socket.join(socket.userId);

  // Track online
  onlineUsers.set(socket.userId, socket.id);
  io.emit("userOnline", socket.userId);

  // Send current online list to newly connected user
  socket.emit("onlineList", Array.from(onlineUsers.keys()));

  socket.on("sendMessage", async ({ receiverId, text, senderText, plainText }) => {
      try {
        const matched = await isMatched(socket.userId, receiverId);
        if (!matched) return socket.emit("error", "Not matched");

        const message = await Message.create({
          senderId: socket.userId,
          receiverId,
          type: "text",
          text,
          senderText: senderText || text,
        });

        const msgObj = message.toJSON();
        io.to(receiverId).emit("newMessage", msgObj);
        socket.emit("newMessage", { ...msgObj, plainText: plainText || text });
      } catch (err) {
        socket.emit("error", err.message);
      }
    });

  // Mark messages as seen
  socket.on("markSeen", async ({ senderId }) => {
    try {
      await Message.updateMany(
        { senderId, receiverId: socket.userId, seenBy: { $ne: socket.userId } },
        { $addToSet: { seenBy: socket.userId } }
      );
      io.to(senderId).emit("messagesSeen", { by: socket.userId });
    } catch (err) {
      console.error(err);
    }
  });

  // Delete message (single)
  socket.on("deleteMessage", async ({ messageId, type }) => {
    try {
      const msg = await Message.findById(messageId);
      if (!msg) return;
      if (type === "everyone" && msg.senderId.toString() === socket.userId) {
        await Message.findByIdAndUpdate(messageId, {
          $addToSet: { deletedFor: [msg.senderId, msg.receiverId] },
          text: "",
        });
        io.to(msg.receiverId.toString()).emit("messageDeleted", { messageId, type: "everyone" });
        socket.emit("messageDeleted", { messageId, type: "everyone" });
      } else {
        await Message.findByIdAndUpdate(messageId, {
          $addToSet: { deletedFor: socket.userId },
        });
        socket.emit("messageDeleted", { messageId, type: "me" });
      }
    } catch (err) {
      console.error(err);
    }
  });

  // Delete multiple messages
  socket.on("deleteMessages", async ({ messageIds, type }) => {
    try {
      for (const messageId of messageIds) {
        const msg = await Message.findById(messageId);
        if (!msg) continue;
        if (type === "everyone" && msg.senderId.toString() === socket.userId) {
          await Message.findByIdAndUpdate(messageId, {
            $addToSet: { deletedFor: [msg.senderId, msg.receiverId] },
            text: "",
          });
          io.to(msg.receiverId.toString()).emit("messageDeleted", { messageId, type: "everyone" });
          socket.emit("messageDeleted", { messageId, type: "everyone" });
        } else {
          await Message.findByIdAndUpdate(messageId, {
            $addToSet: { deletedFor: socket.userId },
          });
          socket.emit("messageDeleted", { messageId, type: "me" });
        }
      }
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Disconnected: ${socket.userId}`);
    onlineUsers.delete(socket.userId);
    io.emit("userOffline", socket.userId);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = { app, server, io };
