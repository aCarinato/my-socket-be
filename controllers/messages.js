import User from '../models/User.js';
import Chat from '../models/Chat.js';
import Notification from '../models/Notification.js';

export const loadMessages = async (userId, messagesWith) => {
  try {
    const user = await Chat.findOne({ user: userId }).populate(
      'chats.messagesWith'
    );

    const chat = user.chats.find(
      (chat) => chat.messagesWith._id.toString() === messagesWith
    );

    if (!chat) {
      return { error: 'No chat found' };
    }

    return { chat };
  } catch (error) {
    console.log(error);
    return { error };
  }
};

export const sendMsg = async (userId, msgSendToUserId, msg) => {
  try {
    // LOGGED IN USER (SENDER)
    const user = await Chat.findOne({ user: userId });

    // RECEIVER
    const msgSendToUser = await Chat.findOne({ user: msgSendToUserId });

    const newMsg = {
      sender: userId,
      receiver: msgSendToUserId,
      msg,
      date: Date.now(),
    };

    // SENDER
    // check if there are previous chats with the receiver
    const previousChat = user.chats.find(
      (chat) => chat.messagesWith.toString() === msgSendToUserId
    );

    if (previousChat) {
      previousChat.messages.push(newMsg);
      await user.save();
    }
    // ther is no previous chat
    else {
      const newChat = { messagesWith: msgSendToUserId, messages: [newMsg] };
      user.chats.unshift(newChat);
      await user.save();
    }

    // RECEIVER
    // check if there are previous chats with the messaging user (the one who messaged)
    const previousChatForReceiver = msgSendToUser.chats.find(
      (chat) => chat.messagesWith.toString() === userId
    );

    if (previousChatForReceiver) {
      previousChatForReceiver.messages.push(newMsg);
      await msgSendToUser.save();
    }
    //
    else {
      const newChat = { messagesWith: userId, messages: [newMsg] };
      msgSendToUser.chats.unshift(newChat);
      await msgSendToUser.save();
    }

    return { newMsg };
  } catch (error) {
    console.error(error);
    return { error };
  }
};

export const setMsgToUnread = async (msgSendToUserId) => {
  try {
    const user = await User.findById(msgSendToUserId);

    if (!user.unreadMessage) {
      user.unreadMessage = true;
      await user.save();
    }

    return;
  } catch (error) {
    console.error(error);
  }
};

export const setNotification = async (senderId, receiverId) => {
  try {
    const newChatMsgNotifications = await Notification.findOne({
      $and: [{ user: receiverId }, { 'notifications.type': 'newChatMsg' }],
    });

    // check if there are already unread notifications of type 'newChatMsg' from the user that sent the message (userId)
    if (newChatMsgNotifications) {
      // are there already messages from the current sender?
      const messagesFromSender = newChatMsgNotifications.notifications.filter(
        (chat) => chat.from.toString() === senderId
      ); //this should return an array with 1 element at max

      if (messagesFromSender.length > 0) {
        // the last notification was read. so it has to be marked as unread
        const messagesFromSenderIsRead = messagesFromSender[0].isRead;

        if (messagesFromSenderIsRead) {
          await Notification.updateOne(
            {
              $and: [{ user: receiverId }, { 'notifications.from': senderId }],
            },
            {
              $set: {
                'notifications.$.isRead': false,
                'notifications.$.date': Date.now(),
              },
            }
          );

          const newNotification = {
            type: 'newChatMsg',
            from: senderId,
            text: 'You have a new message in the conversation with: ',
            isRead: false,
            date: Date.now(),
          };

          return { newNotification };
        } else {
          // could update the date of the notification. Optional?
          return;
        }
      } else {
        // console.log('no messages from this sender. Ever');
        const newNotification = {
          type: 'newChatMsg',
          from: senderId,
          text: 'You have a new message in the conversation with: ',
          isRead: false,
          date: Date.now(),
        };
        await Notification.updateOne(
          {
            user: receiverId,
          },
          {
            $push: { notifications: newNotification },
          }
        );

        return { newNotification };
      }
    } else {
      // There are no notifications of type 'newChatMsg' sender. Then create and push a new notification
      const newNotification = {
        type: 'newChatMsg',
        from: senderId,
        text: 'You have a new message in the conversation with: ',
        isRead: false,
        date: Date.now(),
      };
      await Notification.updateOne(
        {
          user: receiverId,
        },
        {
          $push: { notifications: newNotification },
        }
      );

      return { newNotification };
    }
  } catch (err) {
    console.log(err);
  }
};

export const readNotification = async (notificationTo, msgFrom) => {
  try {
    await Notification.updateOne(
      {
        $and: [{ user: notificationTo }, { 'notifications.from': msgFrom }],
      },
      {
        $set: { 'notifications.$.isRead': true },
      }
    );
  } catch (error) {
    console.log(error);
  }
};

export const deleteMsg = async (userId, messagesWith, messageId) => {
  try {
    const user = await Chat.findOne({ user: userId });

    const chat = user.chats.find(
      (chat) => chat.messagesWith.toString() === messagesWith
    );

    if (!chat) return;

    const messageToDelete = chat.messages.find(
      (message) => message._id.toString() === messageId
    );

    if (!messageToDelete) return;

    if (messageToDelete.sender.toString() !== userId) {
      return;
    }

    const indexOf = chat.messages
      .map((message) => message._id.toString())
      .indexOf(messageToDelete._id.toString());

    await chat.messages.splice(indexOf, 1);

    await user.save();

    return { success: true };
  } catch (error) {
    console.log(error);
  }
};
