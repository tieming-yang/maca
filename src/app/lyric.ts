export const Lyric = {
  sanitizeTimeStamp: (timeStamp: number) => {
    return timeStamp.toString().replace(".", "-");
  },
};
