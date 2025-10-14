import { InsertRow, Song } from "@/data/models/Song";
import { People, PeopleInsert, PeopleRow } from "@/data/models/People";
import { Song as LocalSong, TSong } from "@/songs/Song";
import { CreditInsert } from "@/data/models/Credit";
import { Line, LineInsert } from "@/data/models/Line";

async function migrateFromLocalToSupabase(songs: TSong[]) {
  // console.log("1. songs", songs);
  try {
    await Promise.all(
      songs.filter((song) => song.name !== "打上花火").map(async (song) => {
        const {
          artist,
          composer,
          lyricist,
          end,
          name,
          youtubeId,
          slug,
          lyrics,
        } = song;
        console.log("1. Adding Song");
        const songToAdd: InsertRow = {
          end_seconds: Song.timestampToSeconds(end),
          name,
          youtube_id: youtubeId,
          slug,
        };
        const insertedSong = await Song.insert(songToAdd);
        console.warn({ insertedSong });

        console.log("2. Adding People");
        const peopleToAdd = [artist, composer, lyricist];
        try {
          await Promise.all(
            peopleToAdd.map(async (person) => {
              const personToAdd: PeopleInsert = {
                display_name: person,
              };

              const insertedPerson = await People.insert(personToAdd);
              console.log({ insertedPerson });
            }),
          );
        } catch (error) {
          console.error("people error", error);
        }
        console.log("3. Adding Lyrics");
        try {
          await Promise.all(lyrics.map(async (line) => {
            const lyric = line.text.map((
              part,
            ) => (typeof part === "string" ? part : part.kanji)).join("");

            const lineToAdd: LineInsert = {
              song_id: insertedSong.id,
              timestamp_sec: Song.timestampToSeconds(line.timeStamp),
              lyric,
            };

            const insertedLine = await Line.insert(lineToAdd);
          }));
        } catch (error) {
          console.error("lyrics error", error);
        }
      }),
    );
  } catch (err) {
    console.error("outer err", err);
  }
}

migrateFromLocalToSupabase(LocalSong.songs);
