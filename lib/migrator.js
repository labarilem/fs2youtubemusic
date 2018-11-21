const { google } = require('googleapis');
const googleAuth = require('./google-auth');
const fs = require('fs-extra');
const path = require('path');
const { questionBool } = require('./readline');
const music = require('./music');
const chalk = require('chalk');
const { youtubeSearch, buildQueryForWork, likeVideo } = require('./google-queries');

async function migrateMusicLibrary(rootDirPath) {
  const secret = googleAuth.loadClientSecret();
  let auth = null;
  try{
    auth = await googleAuth.authorize(secret);
  } catch (err) {
    console.log('API auth error: ' + err)
  }

  await migrateDirectory('', rootDirPath, false, '', auth);
}

async function migrateWork(artist, work, auth) {
  const query = buildQueryForWork(artist, work);
  console.log(chalk.yellow('      Querying for: ' + query));
  const response = await youtubeSearch(query, true, auth);
  let i = 0;
  const match = response[i];
  const link = 'https://www.youtube.com/watch?v=' + match.id.videoId;
  const title = match.snippet.title;
  const description = match.snippet.description;
  console.log('      Title: ' + chalk.gray(title));
  console.log('      Description: ' + chalk.gray(description));
  console.log('      Link: ' + chalk.gray(link));

  if (questionBool('      Proceed?')) {
    await likeVideo(match.id.videoId, auth);
  }
}

async function migrateDirectory(dirName, dirPath, isMusicDir, parentName, auth) {
  var childFsItems = fs.readdirSync(dirPath);
  var musicFiles = childFsItems.filter(f => music.isMusicFile(f));
  var musicFilesMetadata = {};

  if (isMusicDir && musicFiles.length > 0) {
    console.log('====> Examining directory: ' + chalk.gray(dirPath));

    const metadata = await music.getFileMetadata(path.join(dirPath, musicFiles[0]));
    let artist = metadata.artist || metadata.albumartist || parentName;
    let albumName = metadata.album || dirName;
    console.log('      Artist: ' + chalk.green(artist));
    console.log('      Album: ' + chalk.green(albumName));

    if (questionBool('      Migrate this directory?')) {
      if (questionBool('      Migrate as album?')) {
        // Migrating whole album
        await migrateWork(artist, albumName, auth);
      } else {
        // Migrating file by file
        for (let musicFileName of musicFiles) {
          const metadata = music.getFileMetadata(path.join(dirPath, musicFileName));
          musicFilesMetadata[musicFileName] = metadata;
          let artist = metadata.artist || metadata.albumartist || parentName;
          let albumName = metadata.album || dirName;
          let songName = metadata.title || musicFileName.replace(path.extname(musicFileName), '');
          console.log('      Artist: ' + chalk.green(artist));
          console.log('      Album: ' + chalk.green(albumName));
          console.log('      Song: ' + chalk.green(songName));
          if (questionBool('      Migrate this song?')) {
            await migrateWork(artist, songName, auth);
          }
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

      await migrateDirectory(itemName, fullPath, true, dirName, auth);
    }
  }
}

exports.migrateMusicLibrary = migrateMusicLibrary;
