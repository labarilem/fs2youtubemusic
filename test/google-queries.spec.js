const chai = require('chai');
const fs = require('fs-extra');
const expect = chai.expect;
const path = require('path');
const { buildQueryForWork } = require('../lib/google-queries')

describe('google-queries', () => {

  describe('buildQueryForWork', () => {

    it('should remove parens', () => {
      var artist = "artist";
      var work = "wonderful song (1999)  [320]";
      var query = buildQueryForWork(artist, work);
      expect(query).eq("artist - wonderful song");
    });

    it('should remove numbers', () => {
      var artist = "artist";
      var work = "01. A song";
      var query = buildQueryForWork(artist, work);
      expect(query).eq("artist - A song");
    });

  });

});
