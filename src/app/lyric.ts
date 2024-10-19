type TextPart = string | { kanji: string; furigana: string };

export type TLine = {
  timeStamp: number;
  text: TextPart[];
};

export type TLyric = {
  artist: string;
  title: string;
  lyricist: string;
  composer: string;
  lines: TLine[];
};

export const Lyric = {
  sanitizeTimeStamp: (timeStamp: number) => {
    return timeStamp.toString().replace(".", "-");
  },
};
