import { 大阪LOVER, 明日への手紙, 欲望に満ちた青年団 } from "@/songs";

type TextPart = string | { kanji: string; furigana: string };

export type TLyric = {
  timeStamp: number;
  text: TextPart[];
};

export type TSong = {
  id: string;
  artist: string;
  name: string;
  youtubeId: string;
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
    欲望に満ちた青年団: 欲望に満ちた青年団,
    明日への手紙: 明日への手紙,
  },
};
