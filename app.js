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
  getUsers,
  addUser,
  removeUserOnLeave,
  removeUser,
  findConnectedUser,
} from './controllers/room.js';
import {
  loadMessages,
  sendMsg,
  setMsgToUnread,
  setNotification,
  readNotification,
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

  socket.on('disconnect', async () => {
    // console.log('ciao ciao');
    // const users = await addUser(userId, socket.id);
    // console.log(socket.id);
    // socket.disconnect();
    // console.log('PRIMA');
    const testone = getUsers();
    // console.log(testone);
    const incriminato = testone.filter((user) => user.socketId === socket.id);
    if (incriminato !== undefined && incriminato.length > 0) {
      const incriminatoId = incriminato[0].userId;
      // console.log('incriminato.userId; ', incriminatoId);
      // console.log('DOPO');
      const newUsers = await removeUserOnLeave(incriminatoId, socket.id);
      // const testone2 = getUsers();
      // console.log(newUsers);
    }
  });

  socket.on('loadMessages', async ({ userId, messagesWith }) => {
    const { chat, error } = await loadMessages(userId, messagesWith);

    !error
      ? socket.emit('messagesLoaded', { chat })
      : socket.emit('noChatFound');
  });

  socket.on('sendNewMsg', async ({ userId, msgSendToUserId, msg }) => {
    // WOULD BE BETTER: socket.on('sendNewMsg', async ({ senderId, receiverId, msg }) => {

    // create a new message and store it in the database for the sender and receiver (Chat.js)
    const { newMsg, error } = await sendMsg(userId, msgSendToUserId, msg);

    // Check if the receiver is online
    const receiverSocket = findConnectedUser(msgSendToUserId);
    console.log(receiverSocket);

    if (receiverSocket) {
      // the receiver is online
      // WHEN YOU WANT TO SEND MESSAGE TO A PARTICULAR SOCKET
      io.to(receiverSocket.socketId).emit('newMsgReceived', { newMsg });

      // (maybe) i need to put a notification here when the receiver is not on the router message with the sender
      // socket.on('newNotification')
    }
    //
    else {
      await setMsgToUnread(userId, msgSendToUserId);
      // here i should also set a notification
      // const { newNotification } =
      await setNotification(userId, msgSendToUserId);
    }

    !error && socket.emit('msgSent', { newMsg });
    // socket.emit('notificationSent');
  });

  socket.on('sendNotification', async ({ senderId, receiverId }) => {
    // console.log(`senderId: ${senderId} receiverId: ${receiverId}`);
    await setNotification(senderId, receiverId);
  });

  socket.on('readNotification', async ({ notificationTo, msgFrom }) => {
    console.log(`notificationTo: ${notificationTo} msgFrom: ${msgFrom}`);
    await readNotification(notificationTo, msgFrom);
  });

  socket.on('leave', async ({ userId }) => {
    const users = await removeUserOnLeave(userId, socket.id);
  });

  // THIS IS IS FOR THE SIMPLE CHAT IN INDEX.JS
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
