const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const { instrument } = require("@socket.io/admin-ui");
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://admin.socket.io"],
    methods: ["GET", "POST"],
  },
});
// app.get("/", (req, res) => {
//   res.sendFile(__dirname + "/index.html");
// });

io.on("connection", async (socket) => {
  console.log("a user is connected", socket.id);
  socket.on("chat message", (msg) => {
    console.log(msg);
    io.emit("chat message", msg);
    socket.on("typing", () => {
      io.emit("typing", "yes");
    });
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});
instrument(server, {
  auth: false,
});
server.listen(3000, () => {
  console.log("listening on *:3000");
});
