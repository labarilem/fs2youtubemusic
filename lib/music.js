const path = require('path');
const mm = require('music-metadata');
const util = require('util');
const chalk = require('chalk');

// Constants
const musicFileExts = ['.mp3', '.flac', '.ogg', '.m4a', '.wav'];

// Functions
function isMusicFile(filename) {
  return musicFileExts.indexOf(path.extname(filename)) >= 0;
}

async function getFileMetadata(filePath) {
  let metadata = null;
  try {
    metadata = await mm.parseFile(filePath, { native: true });
  } catch(err) {
    console.log(chalk.red('No metadata found!' + err));
  }
  return metadata;
}

exports.isMusicFile = isMusicFile;
exports.getFileMetadata = getFileMetadata;
