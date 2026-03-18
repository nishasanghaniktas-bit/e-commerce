let io = null;

exports.init = (server) => {
  const { Server } = require("socket.io");
  io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    // client should send `authenticate` with userId or join 'admin' room
    socket.on("identify", ({ userId, isAdmin }) => {
      if (userId) socket.join(`user_${userId}`);
      if (isAdmin) socket.join("admin");
    });

    socket.on("disconnect", () => {
      // noop for now
    });
  });

  return io;
};

exports.getIo = () => io;

exports.emitToUser = (userId, event, payload) => {
  if (!io || !userId) return;
  io.to(`user_${userId}`).emit(event, payload);
};

exports.emitToAdmins = (event, payload) => {
  if (!io) return;
  io.to("admin").emit(event, payload);
};
