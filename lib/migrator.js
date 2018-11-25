const { google } = require('googleapis');
const googleAuth = require('./google-auth');
const fs = require('fs-extra');
const path = require('path');
const { questionBool, questionNumArray } = require('./readline');
const music = require('./music');
const chalk = require('chalk');
const { youtubeSearch, buildQueryForWork, likeVideo } = require('./google-queries');
const { Song } = require('./model/song');
const { Album } = require('./model/album');
const { getMostFrequentItem } = require('./helpers');

async function migrateMusicLibrary(rootDirPath, skipto) {
  const secret = googleAuth.loadClientSecret();
  let auth = null;
  try {
    auth = await googleAuth.authorize(secret);
  } catch (err) {
    console.log('API auth error: ' + err)
  }

  await migrateDirectory('', rootDirPath, false, '', auth, skipto);
}

async function migrateWork(artist, work, auth, long) {
  const query = buildQueryForWork(artist, work);
  console.log(chalk.yellow('      Querying for: ' + query));
  const response = await youtubeSearch(query, long, auth);

  let i = 0;
  let considerNextOption = true;
  while (considerNextOption && i < response.length) {
    const match = response[i];
    const link = 'https://www.youtube.com/watch?v=' + match.id.videoId;
    const title = match.snippet.title;
    const description = match.snippet.description;
    console.log('      Title: ' + chalk.gray(title));
    console.log('      Description: ' + chalk.gray(description));
    console.log('      Link: ' + chalk.gray(link));

    if (questionBool('      Proceed?')) {
      await likeVideo(match.id.videoId, auth);
      considerNextOption = false;
      console.log('      Liked');
    }
    i++;
  }

  return !considerNextOption;
}

function displaySong(album, song) {
  console.log('      Artist: ' + chalk.green(song.artist));
  console.log('      Album: ' + chalk.green(album.name));
  console.log('      Song: ' + chalk.green(song.name));
}

/**
 *
 * @param {Album} album
 */
function displayAlbum(album) {
  console.log('      Artist: ' + chalk.green(album.artist));
  console.log('      Album: ' + chalk.green(album.name));
  console.log('      Tracks: ' + album.songs.map((s, i) => `[${chalk.yellow(i.toString())}]` + chalk.green(s.name)).join(', '));
}

async function loadAlbum(dirName, dirPath, fileNames, parentName) {
  const metadata = await music.getFileMetadata(path.join(dirPath, fileNames[0]));
  let songs = await loadSongs(dirName, dirPath, fileNames, parentName);
  let artist = metadata ? (metadata.common.artist || metadata.common.albumartist || getMostFrequentItem(songs.map(s => s.artist)) || dirName) : dirName;
  let albumName = metadata ? (metadata.common.album || dirName) : dirName;

  let album = new Album(artist, albumName, songs);
  return album;
}

async function loadSongs(dirName, dirPath, fileNames, parentName) {
  const songs = [];
  for (let musicFileName of fileNames) {
    const metadata = await music.getFileMetadata(path.join(dirPath, musicFileName));

    let artist = metadata ? (metadata.common.artist || metadata.common.albumartist || parentName) : parentName;

    let songNameFromFile = musicFileName.replace(path.extname(musicFileName), '');
    let songName = metadata ? (metadata.common.title || songNameFromFile) : songNameFromFile;

    songs.push(new Song(artist, songName));
  };
  return songs;
}

async function migrateDirectory(dirName, dirPath, isMusicDir, parentName, auth, skipto) {
  var childFsItems = fs.readdirSync(dirPath);
  var musicFiles = childFsItems.filter(f => music.isMusicFile(f));

  if (isMusicDir && musicFiles.length > 0 && dirPath.indexOf(skipto) >= 0) {

    // hack
    skipto = '';

    console.log('====> Examining directory: ' + chalk.gray(dirPath));

    const album = await loadAlbum(dirName, dirPath, musicFiles, parentName);
    displayAlbum(album);

    if (questionBool('      Migrate this directory?')) {
      if (questionBool('      Migrate as album?') && await migrateWork(album.artist, album.name, auth, true)) {
        // Migrating whole album
      } else {
        // Migrating song by song
        let songsIndexes = questionNumArray('      Specify songs: ', album.songs.length);
        for (let songIndex of songsIndexes) {
          const song = album.songs[songIndex];
          displaySong(album, song);
          const migrated = await migrateWork(song.artist, song.name, auth, false);
        };
      }
    }

    console.log('\n');
  }

  // Migrating subfolders
  for (let itemName of childFsItems) {
    const fullPath = path.join(dirPath, itemName);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {

      skipto = await migrateDirectory(itemName, fullPath, true, dirName, auth, skipto);
    }
  }

  return skipto;
}

exports.migrateMusicLibrary = migrateMusicLibrary;
