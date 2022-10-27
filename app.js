import express from 'express';
import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';

import connectDB from './helper/db/db.js';
// API routes
import auth from './routes/auth.js';
import chats from './routes/chats.js';
// socket controllers
import {
  addUser,
  removeUserOnLeave,
  removeUser,
  findConnectedUser,
} from './controllers/room.js';
import {
  loadMessages,
  sendMsg,
  setMsgToUnread,
} from './controllers/messages.js';

connectDB();

const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } }); // TEST socket on vercel

io.on('connection', (socket) => {
  socket.on('join', async ({ userId }) => {
    const users = await addUser(userId, socket.id);

    setInterval(() => {
      // filter out the current user
      socket.emit('connectedUsers', {
        users: users.filter((user) => user.userId !== userId),
      });
    }, 10000);
  });

  socket.on('loadMessages', async ({ userId, messagesWith }) => {
    const { chat, error } = await loadMessages(userId, messagesWith);

    !error
      ? socket.emit('messagesLoaded', { chat })
      : socket.emit('noChatFound');
  });

  socket.on('sendNewMsg', async ({ userId, msgSendToUserId, msg }) => {
    const { newMsg, error } = await sendMsg(userId, msgSendToUserId, msg);

    // Check if the receiver is online
    const receiverSocket = findConnectedUser(msgSendToUserId);

    if (receiverSocket) {
      // the receiver is online
      // WHEN YOU WANT TO SEND MESSAGE TO A PARTICULAR SOCKET
      io.to(receiverSocket.socketId).emit('newMsgReceived', { newMsg });
    }
    //
    else {
      await setMsgToUnread(msgSendToUserId);
    }

    !error && socket.emit('msgSent', { newMsg });
  });

  socket.on('leave', async ({ userId }) => {
    const users = await removeUserOnLeave(userId, socket.id);
  });

  socket.on('sendMsg', (msg) => {
    // console.log('Msg received through socket: ' + msg);
    io.emit('sendMsg', msg);
  });
});

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
app.use('/api/chats', chats);

httpServer.listen(port, () => console.log(`Server running on port ${port}`));
