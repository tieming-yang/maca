import { 大阪LOVER } from "@/songs";

type TextPart = string | { kanji: string; furigana: string };

export type TLyric = {
  timeStamp: number;
  text: TextPart[];
};

export type TSong = {
  artist: string;
  title: string;
  lyricist: string;
  composer: string;
  lyrics: TLyric[];
};

export const Song = {
  sanitizeTimeStamp: (timeStamp: number) => {
    return timeStamp.toString().replace(".", "-");
  },

  songs: {
    大阪LOVER: 大阪LOVER,
  },
};
