const users = [];

export const getUsers = () => {
  return users;
};

export const addUser = async (userId, socketId) => {
  const user = users.find((user) => user.userId === userId);

  if (user && user.socketId === socketId) {
    // the user is already there, so no need to add it
    return users;
  }
  //
  else {
    if (user && user.socketId !== socketId) {
      // the user is in another room (?)
      await removeUser(user.socketId);
    }

    const newUser = { userId, socketId };

    users.push(newUser);

    return users;
  }
};

export const removeUser = async (socketId) => {
  const indexOf = users.map((user) => user.socketId).indexOf(socketId);

  users.splice(indexOf, 1);

  // console.log('from inside removeUser');
  // console.log(users);
  // console.log('---------');
  return;
};

export const removeUserOnLeave = async (userId, socketId) => {
  // console.log(`userId ${userId}, socketId: ${socketId}`);
  const user = users.find((user) => user.userId === userId);

  // console.log('from inside removeUserOnLeave');
  // console.log(user);
  // console.log('---------');

  if (user && user.socketId === socketId) {
    // the user is already there, so it has to be removed
    await removeUser(user.socketId);
    return users;
  }
};

// find out if the message receiver is online (when the message is sent)
// it doesn't necessarily mean that he is in the message url with the sender (openChatId.current)
export const findConnectedUser = (userId) =>
  users.find((user) => user.userId === userId);
