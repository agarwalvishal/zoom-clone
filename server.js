import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import http from 'http';
import { Server } from 'socket.io';
import { ExpressPeerServer } from 'peer';

console.log('process.env.PORT:', process.env.PORT);
const PORT = process.env.PORT || 3000;
let PEER_PORT = undefined;

console.log(`process.env.NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`process.env.PEER_PORT: ${process.env.PEER_PORT}`);

// If not in production & not using docker compose to pass PEER_PORT env variable,
// i.e., the app is started using npm instead of using docker compose
// use default port 3000 for peerjs client
if (process.env.NODE_ENV === 'production') {
  PEER_PORT = 443;
} else if (process.env.NODE_ENV !== 'production' && process.env.PEER_PORT) {
  PEER_PORT = process.env.PEER_PORT;
} else {
  PEER_PORT = 3000;
}

console.log(`Passing to frontend PEER_PORT: ${PEER_PORT}`);

const app = express();
const server = http.Server(app);
const io = new Server(server);

// Combining peer with existing express app
const peerServer = ExpressPeerServer(server, {
  debug: true
});

app.set('view engine', 'ejs');

// Use the pulbic directory to serve static files
app.use(express.static('public'));
app.use('/peerjs', peerServer);

app.get('/', (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get('/:room', (req, res) => {
  // Also pass PEER_PORT to frontend for peerjs endpoint requests
  res.render('room', { roomId: req.params.room, peerPort: PEER_PORT });
});

server.listen(PORT, () => {
  console.log(`app is running on localhost:${PORT}`);
});

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    console.log(`joined room: ${roomId} with user: ${userId}`);
    socket.join(roomId);
    socket.broadcast.to(roomId).emit('user-connected', userId);
    
    socket.on('message', (message, userId) => {
      io.to(roomId).emit('create-message', message, userId);
    });

    socket.on('disconnect', () => {
      socket.broadcast.to(roomId).emit('user-disconnected', userId);
    });
  });
});
