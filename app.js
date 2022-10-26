import express from 'express';
import 'dotenv/config';
import { createServer } from 'http';
// import { Server } from 'socket.io'; // TEST socket on vercel

import connectDB from './helper/db/db.js';
// routes
import auth from './routes/auth.js';
// controllers
import { addUser, removeUserOnLeave, removeUser } from './controllers/room.js';

connectDB();

const app = express();

const httpServer = createServer(app);
// const io = new Server(httpServer, { cors: { origin: '*' } }); // TEST socket on vercel

// const io = new Server(httpServer, {
//   cors: {
//     origin: 'http://localhost:3000/',
//     methods: ['GET', 'POST'],
//     allowedHeaders: ['Content-type'],
//   },
// });

// io.on('connection', (socket) => { // TEST socket on vercel
//   socket.on('join', async ({ userId }) => {
//     const users = await addUser(userId, socket.id);

//     setInterval(() => {
//       // filter out the current user
//       socket.emit('connectedUsers', {
//         users: users.filter((user) => user.userId !== userId),
//       });
//     }, 10000);
//   });

//   socket.on('leave', async ({ userId }) => {
//     const users = await removeUserOnLeave(userId, socket.id);
//   });

//   // socket.on('disconnect', () => {
//   //   removeUser(socket.id);
//   // });

//   // socket.on('msgSent', ({ arg1, arg2 }) => {
//   //   console.log({ arg1, arg2 });

//   //   socket.emit('msgReceived', {
//   //     msg: `hi! I received a msg with 2 args: ${arg1} and ${arg2}`,
//   //   });
//   // });

//   socket.on('sendMsg', (msg) => {
//     // console.log('Msg received through socket: ' + msg);
//     io.emit('sendMsg', msg);
//   });
// });

const port = process.env.PORT || 8000;

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, PUT, DELETE'
  );

  next();
});

app.use('/api/auth', auth);

httpServer.listen(port, () => console.log(`Server running on port ${port}`));
