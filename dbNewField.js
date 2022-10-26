import User from './models/User.js';
import Chat from './models/Chat.js';
import connectDB from './helper/db/db.js';

connectDB();

const addField = async () => {
  try {
    // NEW USERS
    // let newUser;

    // newUser = new User({
    //   username: 'user1',
    //   password: 'user1',
    // });
    // await newUser.save();

    // newUser = new User({
    //   username: 'user2',
    //   password: 'user2',
    // });
    // await newUser.save();

    // newUser = new User({
    //   username: 'user3',
    //   password: 'user3',
    // });
    // await newUser.save();

    // CHAT MODELS
    let newChatModel;

    // Chat.aggregate([
    //   { $match: { user: '6356777623e206b27818a20b' } },
    //   { $addFields: { chats: { $concatArrays: ['$homework', [7]] } } },
    // ]);

    // user1 to user2
    await Chat.findOneAndUpdate(
      { user: '6356777623e206b27818a20b' },
      {
        // $set: {
        //   'chats.$.messagesWith': '6356777623e206b27818a208',
        //   // 'chats.messages': []
        // },
        // $push: {
        //   'chats.messagesWith': '6356777623e206b27818a208',
        //   'chats.messages': {
        //     msg: 'ciao beoo',
        //     sender: '6356777623e206b27818a20b',
        //     receiver: '6356777623e206b27818a208',
        //     date: Date.now(),
        //   },
        // },
      }
    );

    // await User.aggregate([
    //   { $addFields: { testField: { type: String, default: 'testone' } } },
    // ]);
    // await User.updateMany(
    //   {},
    //   {
    //     $set: {
    //       nNotifications: 0,
    //       conversations: [],
    //     },
    //   }
    // );
    // ----------------------------------- //
    // await Conversation.updateMany(
    //   {},
    //   {
    //     $set: {
    //       lastMessageIsRead: false,
    //     },
    //   }
    // );
    // ----------------------------------- //
    // await User.updateMany({}, { newField: 'sucaa' });
    // await User.aggregate([{ $addFields: { testField: 'testaa' } }]);
    // await User.updateOne(
    //   { username: 'ale' },
    //   { $set: { isProfileCompleted: false } }
    // );
    console.log('FATTA');
  } catch (err) {
    console.log(err);
  }
};

addField();
