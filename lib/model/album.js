const { Song } = require("./song");

class Album {

  /**
   *
   * @param {string} artist
   * @param {string} name
   * @param {Song[]} songs
   */
  constructor(artist, name, songs) {
    this.artist = artist;
    this.name = name;
    this.songs = songs;
  }

}

exports.Album = Album;
