let ioInstance = null;

export const setIo = (io) => {
  ioInstance = io;
};

export const emitLeaderboardUpdate = (payload) => {
  if (ioInstance) {
    ioInstance.emit("leaderboard:update", payload);
  }
};
