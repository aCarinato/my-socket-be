import User from '../models/User.js';
import Chat from '../models/Chat.js';
import Notification from '../models/Notification.js';

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  const { username, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ username: username }).select(
      '+password'
    );
    // res.status(200).json(existingUser);
  } catch (err) {
    res.status(500).json(err);
  }

  if (!existingUser) {
    // this becomes res.data.error in the frontend
    return res.json({
      error: 'The email address you entered is incorrect',
    });
  }

  let isValidPassword;
  isValidPassword = password === existingUser.password;

  if (!isValidPassword) {
    return res.json({
      error: 'The password you entered is incorrect',
    });
  }

  let token;
  //   token = jwt.sign(
  //     { _id: existingUser._id, email: existingUser.email },
  //     process.env.JWT_SECRET,
  //     { expiresIn: '7d' }
  //   );
  token = `username${existingUser.username}.surfisgood`;

  const chatModel = await Chat.findOne({ user: existingUser._id });
  if (!chatModel) {
    await new Chat({ user: existingUser._id, chats: [] }).save();
  }

  const notificationModel = await Notification.findOne({
    user: existingUser._id,
  });
  if (!notificationModel) {
    await new Notification({
      user: existingUser._id,
      notifications: [],
    }).save();
  }

  res.status(201).json({
    success: true,
    loginUser: {
      username: existingUser.username,
      userId: existingUser._id,
      token: token,
    },
  });
};

// 6356777523e206b27818a204 user1
// user2 6356777623e206b27818a208
// user3 6356777623e206b27818a20b
