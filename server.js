import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import http from 'http';
import { Server } from 'socket.io';
import { ExpressPeerServer } from 'peer';

console.log('process.env.PORT:', process.env.PORT);
const PORT = process.env.PORT || 3000;

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
  res.render('room', { roomId: req.params.room, port: PORT }); // Pass PORT to frontend for peerjs endpoint requests
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
