const users = [];

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

  return;
};

export const removeUserOnLeave = async (userId, socketId) => {
  const user = users.find((user) => user.userId === userId);

  if (user && user.socketId === socketId) {
    // the user is already there, so it has to be removed
    await removeUser(user.socketId);
    return users;
  }
};

export const findConnectedUser = (userId) =>
  users.find((user) => user.userId === userId);
