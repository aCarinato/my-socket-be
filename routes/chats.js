import express from 'express';

const router = express.Router();

import {
  getChats,
  getUsers,
  getUserInfo,
  getNotifications,
} from '../controllers/chats.js';

// import { requireSignin } from '../middlewares/checkAuth.js';

router.get('/users/:username', getUsers);
router.get('/:userId', getChats);
router.get('/user/:userToFindId', getUserInfo);
router.get('/notifications/:userId', getNotifications);

// router.get('/current-user', requireSignin, currentUser);

export default router;
