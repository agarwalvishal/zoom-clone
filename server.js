import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import http from 'http';

const app = express();
const server = http.Server(app);

app.set('view engine', 'ejs');

// Use the pulbic directory to serve static files
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room });
});

server.listen(3000, () => {
  console.log('app is running on localhost:3000');
});
