import {
  おれの小樽,
  僕が死のうと思ったのは,
  大阪LOVER,
  打上花火,
  明日への手紙,
  欲望に満ちた青年団,
} from "@/songs";

type TextPart = string | { kanji: string; furigana: string };

export type TLyric = {
  timeStamp: number | string;
  text: TextPart[];
  zh?: string;
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

type SanitizedLyric = Omit<TLyric, "timeStamp"> & { timeStamp: number };
type SanitizedSong = Omit<TSong, "lyrics"> & { lyrics: SanitizedLyric[] };

export const Song = {
  sanitizeTimeStamp: (timeStamp: number): string => {
    return timeStamp.toString().replace(".", "-");
  },

  timestampToSeconds(timestamp: string | number): number {
    if (!timestamp) return 0;
    if (typeof timestamp === "number") return Math.round(timestamp);

    const [minutes, seconds] = timestamp.split(":");

    return Math.round(Number(minutes) * 60 + Number(seconds));
  },

  sanitizeCurrentSong(currentSong: TSong): SanitizedSong {
    return {
      ...currentSong,
      lyrics: currentSong.lyrics.map((lyric) => ({
        ...lyric,
        timeStamp: Song.timestampToSeconds(lyric.timeStamp),
      })),
    };
  },

  songs: {
    大阪LOVER: 大阪LOVER,
    欲望に満ちた青年団: 欲望に満ちた青年団,
    明日への手紙: 明日への手紙,
    おれの小樽: おれの小樽,
    僕が死のうと思ったのは: 僕が死のうと思ったのは,
    打上花火: 打上花火,
  },
};
