import express from 'express';

const router = express.Router();

import { login } from '../controllers/auth.js';

// import { requireSignin } from '../middlewares/checkAuth.js';

router.post('/login', login);
// router.get('/current-user', requireSignin, currentUser);

export default router;
