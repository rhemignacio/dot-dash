const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let rooms = {};

function getRandomDelay() {
  return Math.floor(Math.random() * 3000) + 3000;
}

io.on('connection', (socket) => {
  socket.on('joinGame', (roomId) => {
    socket.join(roomId);
    if (!rooms[roomId]) rooms[roomId] = {};
    rooms[roomId][socket.id] = { score: 0 };
    io.to(roomId).emit('playerUpdate', rooms[roomId]);
    if (Object.keys(rooms[roomId]).length === 2) startGame(roomId);
  });

  socket.on('clickDot', (roomId) => {
    if (!rooms[roomId]?.clicked) {
      rooms[roomId].clicked = true;
      rooms[roomId][socket.id].score += 1;
      io.to(roomId).emit('playerUpdate', rooms[roomId]);

      if (rooms[roomId][socket.id].score >= 10) {
        io.to(roomId).emit('gameOver', socket.id);
        delete rooms[roomId];
      } else {
        setTimeout(() => showDot(roomId), getRandomDelay());
      }
    }
  });

  socket.on('disconnect', () => {
    for (let roomId in rooms) {
      if (rooms[roomId][socket.id]) {
        delete rooms[roomId][socket.id];
        io.to(roomId).emit('playerUpdate', rooms[roomId]);
      }
    }
  });
});

function startGame(roomId) {
  showDot(roomId);
}

function showDot(roomId) {
  if (!rooms[roomId]) return;
  rooms[roomId].clicked = false;
  io.to(roomId).emit('showDot');
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});