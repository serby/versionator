var versionator = require('../')
  , fs = require('fs')
  , mkdirp = require('mkdirp')
  , async = require('async')

function createFiles(dirPath, files, dirs, callback) {
  var fns = [
    async.apply(mkdirp, dirPath + '/sub')
  ]

  Object.keys(files).forEach(function(filename) {
    fns.push(async.apply(fs.writeFile, dirPath + '/' + filename, files[filename]))
  })
  Object.keys(files).forEach(function(filename) {
    fns.push(async.apply(fs.symlink, dirPath + '/' + filename, dirPath + '/' + filename + '_link'))
  });
  dirs.forEach(function(dir) {
    fns.push(async.apply(fs.symlink, dirPath + '/' + dir, dirPath + '/' + dir + '_link'))
  });
  async.series(fns, callback)
}

function removeFiles(dirPath, files, dirs, callback) {
  var fns = []

  Object.keys(files).forEach(function(filename) {
    fns.push(async.apply(fs.unlink, dirPath + '/' + filename))
  })
  Object.keys(files).forEach(function(filename) {
    fns.push(async.apply(fs.unlink, dirPath + '/' + filename + '_link'))
  })
  dirs.forEach(function(dir) {
    fns.push(async.apply(fs.unlink, dirPath + '/' + dir + '_link'))
  });

  fns.push(async.apply(fs.rmdir, dirPath + '/sub'))
  fns.push(async.apply(fs.rmdir, dirPath))

  async.series(fns, callback)
}

describe('versionator', function() {

  var
    tmpPath = '/tmp/versionator-test'
    , files =
      { 'a': ''
      , 'b': 'Hello'
      , 'c': 'World!'
      , 'sub/a': 'hi'
      }
    , dirs = [ 'sub' ]

  before(function(done) {
    createFiles(tmpPath, files, dirs, done)
  })

  describe('map path validation', function() {

    it('should error if an invalid path is given', function() {

      versionator.createMapFromPath('', function(error) {
        error.should.be.instanceof(Error).with.property('message').eql('Path is required')
      })
    })

    it('should correctly walk directory and create hashes', function(done) {
      versionator.createMapFromPath(tmpPath, function(error, results) {

        var a =
          { '/a': '/d41d8cd98f00b204e9800998ecf8427e/a'
          , '/a_link': '/d41d8cd98f00b204e9800998ecf8427e/a_link'
          , '/b': '/8b1a9953c4611296a827abf8c47804d7/b'
          , '/b_link': '/8b1a9953c4611296a827abf8c47804d7/b_link'
          , '/c': '/e509465ef513154988e088d6ad3c21bf/c'
          , '/c_link': '/e509465ef513154988e088d6ad3c21bf/c_link'
          , '/sub/a': '/sub/49f68a5c8493ec2c0bf489821c21fc3b/a'
          , '/sub/a_link': '/sub/49f68a5c8493ec2c0bf489821c21fc3b/a_link'
          }
        a.should.eql(results)

        done()
      })

    })

    it('should accept fileList and create hashes', function(done) {
      var fileList =
        [ tmpPath + '/c'
        , tmpPath + '/sub/a'
        ]
      versionator.createMapFromPath(tmpPath, { fileList: fileList }, function(error, results) {

        var a =
          { '/c': '/e509465ef513154988e088d6ad3c21bf/c'
          , '/sub/a': '/sub/49f68a5c8493ec2c0bf489821c21fc3b/a'
          }
        a.should.eql(results)
        done()
      })

    })

  })

  describe('relative paths', function () {

    it('should resolve relative paths', function(done) {

      versionator.createMapFromPath(tmpPath + '/a/..', function(error, results) {

        var a =
          { '/a': '/d41d8cd98f00b204e9800998ecf8427e/a'
          , '/a_link': '/d41d8cd98f00b204e9800998ecf8427e/a_link'
          , '/b': '/8b1a9953c4611296a827abf8c47804d7/b'
          , '/b_link': '/8b1a9953c4611296a827abf8c47804d7/b_link'
          , '/c': '/e509465ef513154988e088d6ad3c21bf/c'
          , '/c_link': '/e509465ef513154988e088d6ad3c21bf/c_link'
          , '/sub/a': '/sub/49f68a5c8493ec2c0bf489821c21fc3b/a'
          , '/sub/a_link': '/sub/49f68a5c8493ec2c0bf489821c21fc3b/a_link'
          }

        a.should.eql(results)

        done()

      })

    })

  })

  after(function(done) {
    removeFiles(tmpPath, files, dirs, done)
  })
})
