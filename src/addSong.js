const fs = require("fs");
const path = require("path");

// Arguments: Update these values for each new song
const songDetails = {
  artist: "米津玄師",
  name: "打上花火",
  lyricist: "米津玄師",
  composer: "米津玄師",
  youtubeId: "tKVN2mAKRI",
};

// Main function to add a new song
function addNewSong({ artist, name, lyricist, composer, youtubeId }) {
  const songsDir = path.join(__dirname, "songs");
  const songFileName = `${name}.ts`;
  const songFilePath = path.join(songsDir, songFileName);
  const indexFilePath = path.join(songsDir, "index.ts");
  const songTsFilePath = path.join(songsDir, "Song.ts");

  // Template for the new song file
  const songTemplate = `
    export const ${name} = {
      id: "${name}",
      artist: "${artist}",
      name: "${name}",
      lyricist: "${lyricist}",
      composer: "${composer}",
      youtubeId: "${youtubeId}",
      lyrics: [],
    };
  `;

  // Create the new song file
  if (!fs.existsSync(songFilePath)) {
    fs.writeFileSync(songFilePath, songTemplate, { encoding: "utf8" });
    console.log(`Created ${songFileName}`);
  } else {
    console.log(`${songFileName} already exists.`);
  }

  // Update index.ts
  let indexContent = fs.readFileSync(indexFilePath, "utf8");
  const newIndexEntry = `export { ${name} } from './${name}';\n`;
  if (!indexContent.includes(newIndexEntry)) {
    indexContent += newIndexEntry;
    fs.writeFileSync(indexFilePath, indexContent, { encoding: "utf8" });
    console.log(`Updated index.ts with ${name}`);
  } else {
    console.log(`index.ts already includes ${name}`);
  }

  // Update Song.ts
  let songTsContent = fs.readFileSync(songTsFilePath, "utf8");

  // Update the import statement
  const importPattern = /import\s+{([\s\S]*?)}\s+from\s+"@\/songs";/;
  const importMatch = songTsContent.match(importPattern);
  if (importMatch) {
    const imports = importMatch[1].trim();
    const updatedImports = imports.split(",").map((i) => i.trim());
    if (!updatedImports.includes(name)) {
      updatedImports.push(name);
      const sanitizedImports = updatedImports.join(", ");
      songTsContent = songTsContent.replace(
        importPattern,
        `import { ${sanitizedImports} } from "@/songs";`
      );
      console.log(`Updated import statement in Song.ts with ${name}`);
    }
  } else {
    console.error("Could not find the import statement in Song.ts");
  }

  // Update the songs object
  const songsObjectPattern = /songs: {\s*([\s\S]*?)\s*}/;
  const match = songsObjectPattern.exec(songTsContent);
  if (match) {
    const songsObject = match[1].trim();
    const updatedSongsObject = songsObject
      ? `${songsObject}\n    ${name}: ${name}`
      : `${name}: ${name}`;
    const sanitizedSongsObject = updatedSongsObject.replace(/,\s*$/, ""); // Remove trailing comma
    songTsContent = songTsContent.replace(
      songsObjectPattern,
      `songs: {\n    ${sanitizedSongsObject}\n  }`
    );
    fs.writeFileSync(songTsFilePath, songTsContent, { encoding: "utf8" });
    console.log(`Updated Song.ts with ${name}`);
  } else {
    console.error('Could not find "songs" object in Song.ts');
  }
}

// Execute the function with the specified details
addNewSong(songDetails);
