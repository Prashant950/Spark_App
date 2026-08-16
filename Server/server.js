const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");


// Load Environment Variables from the Server folder
dotenv.config({ path: path.resolve(__dirname, ".env") });

// Connect Database
connectDB();

const app = express();

// Middlewares
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"],},});

// Socket.io Realtime Connection Setup Chat with Persons
const onlineUsers = new Map(); // userId -> socketId

io.on("connection", (socket) => {
  console.log("User Connected to Socket:", socket.id);

  socket.on("join_room", (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  // Listen for Live Messages
  socket.on("send_message", (data) => {
    const { receiverId, message } = data;
    // Emit message directly to receiver's socket room
    io.to(receiverId).emit("receive_message", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Audio and Video Call Socket.io Setup
// server.js ke socket connections me:
io.on("connection", (socket) => {
  console.log("User connected to socket:", socket.id);

  // User online register karne ke liye
  socket.on("register_user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  // 1. Call Initiate Karein
  socket.on("call_user", ({ userToCall, channelName, callType, callerName, callerPhoto }) => {
    const receiverSocketId = onlineUsers.get(userToCall);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incoming_call", {
        channelName,
        callType,
        from: socket.id,
        callerName,
        callerPhoto,
      });
    } else {
      socket.emit("user_offline");
    }
  });

  // 2. Call Answer/Pick Up Hua
  socket.on("answer_call", ({ to }) => {
    const callerSocketId = onlineUsers.get(to);
    if (callerSocketId) {
      io.to(callerSocketId).emit("call_accepted");
    }
  });

  // 3. Call Reject/Decline Hua
  socket.on("reject_call", ({ to }) => {
    const callerSocketId = onlineUsers.get(to);
    if (callerSocketId) {
      io.to(callerSocketId).emit("call_rejected");
    }
  });

  // 4. Call End/Hangup Hua
  socket.on("end_call", ({ to }) => {
    const targetSocketId = onlineUsers.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("call_ended");
    }
  });

  socket.on("disconnect", () => {
    // Online map se user remove karein
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
  });
});


// Route Handlers
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Register swipe, match & chat routes
app.use("/api/swipe", require("./routes/swipeRoutes"));
app.use("/api/matches", require("./routes/matchRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));

// Base Endpoint
app.get("/", (req, res) => {
  res.send("Spark Dating App API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Spark Server running on port ${PORT}`);
});