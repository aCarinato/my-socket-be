import Chat from '../models/Chat';
import User from '../models/User';

// GET ALL CHATS FOR A USER

export const getAllChats = async (req, res) => {
  try {
    const { userId } = req.query;

    const user = await Chat.findOne({ user: userId }).populate(
      'chats.messagesWith'
    );

    let chatsToBeSent = [];

    if (user.chats.length > 0) {
      chatsToBeSent = user.chats.map((chat) => ({
        messagesWith: chat.messagesWith._id,
        name: chat.messagesWith.name,
        profilePicUrl: chat.messagesWith.profilePicUrl,
        lastMessage: chat.messages[chat.messages.length - 1].msg,
        date: chat.messages[chat.messages.length - 1].date,
      }));
    }

    return res.json(chatsToBeSent);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server Error');
  }
};

// GET USER INFO

// router.get('/user/:userToFindId', authMiddleware, async (req, res) => {
export const getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.params.userToFindId);

    if (!user) {
      return res.status(404).send('No User found');
    }

    return res.json({ name: user.name, profilePicUrl: user.profilePicUrl });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server Error');
  }
};

// Delete a chat

// router.delete(`/:messagesWith`, authMiddleware, async (req, res) => {
export const deleteChat = async (req, res) => {
  try {
    const { userId } = req;
    const { messagesWith } = req.params;

    await Chat.findOneAndUpdate(
      { user: userId },
      { $pull: { chats: { messagesWith } } }
    );
    return res.status(200).send('Chat deleted');

    // const user = await ChatModel.findOne({ user: userId });

    // const chatToDelete = user.chats.find(
    //   chat => chat.messagesWith.toString() === messagesWith
    // );

    // if (!chatToDelete) {
    //   return res.status(404).send("Chat not found");
    // }

    // const indexOf = user.chats
    //   .map(chat => chat.messagesWith.toString())
    //   .indexOf(messagesWith);

    // user.chats.splice(indexOf, 1);

    // await user.save();

    // return res.status(200).send("Chat deleted");
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server Error');
  }
};

// SET UNREAD MESSAGE TO READ

// router.post('/', authMiddleware, async (req, res) => {
export const setUnreadMsgToRead = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user.unreadMessage) {
      user.unreadMessage = true;
      await user.save();
    }

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    return res.status(500).send(`Server error`);
  }
};
