var assert = require('assert')
  , request = require('request')
  , versionator = require('../')
  , appEngine = require('connect')
  , fs = require('fs')
  , mkdirp = require('mkdirp')
  , async = require('async')
  ;

function createFiles(dirPath, files, callback) {
  var fns = [
    async.apply(mkdirp, dirPath + '/sub')
  ];

  Object.keys(files).forEach(function(filename) {
    fns.push(async.apply(fs.writeFile, dirPath + '/' + filename, files[filename]));
  });

  async.series(fns, callback);
}

function removeFiles(dirPath, files, callback) {
  var fns = [];

  Object.keys(files).forEach(function(filename) {
    fns.push(async.apply(fs.unlink, dirPath + '/' + filename));
  });

  fns.push(async.apply(fs.rmdir, dirPath + '/sub'));
  fns.push(async.apply(fs.rmdir, dirPath));

  async.series(fns, callback);
}

describe('versionator', function() {

  var
    tmpPath = '/tmp/versionator-test',
    files = {
      'a': '',
      'b': 'Hello',
      'c': 'World!',
      'sub/a': 'hi'
    };

  before(function(done) {
    createFiles(tmpPath, files, done);
  });

  describe('map path validation', function() {

    it('should error if an invalid path is given', function() {

      versionator.createMapFromPath('', function(error) {
        error.should.be.instanceof(Error).with.property('message').eql('Path is required');
      });
    });

    it('should correctly walk directory and create hashes', function(done) {

      versionator.createMapFromPath(tmpPath, function(error, results) {

        var a = {
          '/a': '/d41d8cd98f00b204e9800998ecf8427e/a',
          '/b': '/8b1a9953c4611296a827abf8c47804d7/b',
          '/c': '/e509465ef513154988e088d6ad3c21bf/c',
          '/sub/a': '/sub/49f68a5c8493ec2c0bf489821c21fc3b/a' }.should.eql(results);

        done();
      });

    });

    it('should accept fileList and create hashes', function(done) {
      var fileList = [
        tmpPath + '/c',
        tmpPath + '/sub/a'
      ];
      versionator.createMapFromPath(tmpPath, { fileList: fileList}, function(error, results) {

        var a = {
          '/c': '/e509465ef513154988e088d6ad3c21bf/c',
          '/sub/a': '/sub/49f68a5c8493ec2c0bf489821c21fc3b/a' }.should.eql(results);

        done();
      });

    });

    describe('with a symlink', function(done) {
        beforeEach(function(done) {
            fs.symlink(tmpPath + '/b', tmpPath + '/b_symlink', 'file', done);
        });

        it('create hash for symlink', function(done) {
            versionator.createMapFromPath(tmpPath, function(error, results) {

                results['/b_symlink'].should.equal('/8b1a9953c4611296a827abf8c47804d7/b_symlink');

                done()
            });

        });

        afterEach(function(done) {
            fs.unlink(tmpPath + '/b_symlink', done);
        });

    });

  });

  after(function(done) {
    removeFiles(tmpPath, files, done);
  });
});
