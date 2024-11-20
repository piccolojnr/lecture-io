import { Server } from "socket.io";
import express from "express";
import { createServer } from "http";
import cors from "cors";

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Join lecture-specific room
  socket.on("join-lecture", (lectureId) => {
    socket.join(`lecture-${lectureId}`);
    console.log(`Socket ${socket.id} joined lecture-${lectureId}`);
  });

  // Handle note changes
  socket.on("note-change", (note) => {
    // Broadcast the change to all clients in the same lecture room except sender
    socket.to(`lecture-${note.lectureId}`).emit("note-update", note);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.SOCKET_PORT || 4000;

server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
