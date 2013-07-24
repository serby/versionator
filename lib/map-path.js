var url = require('url')
  , async = require('async')
  , crypto = require('crypto')
  , fs = require('fs')
  , path = require('path')
  , _ = require('lodash')
  , walker = require('walker')


module.exports = function(dirPath, params, callback) {

  var
    files = []

  if ((callback === undefined) && (typeof params === 'function')) {
    callback = params
  }

  var options = _.extend({
      basePath: '',
      hash: hash
    }, params)

  if (!dirPath) {
    return callback(new Error('Path is required'))
  }

  function hash(filename, callback) {
    var
      md5sum = crypto.createHash('md5'),
      s = fs.ReadStream(filename)

    s.on('data', function(d) {
      md5sum.update(d)
    })

    s.on('end', function() {
      callback(undefined, md5sum.digest('hex'))
    })
  }

  function makeHashMap (callback) {
    var hashMap = Object.create(null)
    async.forEach(files, function(filename, fileCallback) {
      hash(filename, function(error, fileHash) {

        var
          urlPath = path.normalize('/' + filename.substring(dirPath.length + 1)).replace(/\\/g, '/'),
          pos = urlPath.lastIndexOf('/')

        hashMap[urlPath] =
          urlPath.substring(0, pos) + '/' + fileHash +
          urlPath.substring(pos) || url

        fileCallback(error)
      })
    }, function(error) {
      if (error) {
        return callback(error)
      }
      callback(undefined, hashMap)
    })
  }

  if (options.fileList) {
    for (var i in options.fileList) {
      files.push(options.fileList[i])
    }
    makeHashMap(callback)
    return
  }

  walker(dirPath)

  .on('file', function(filename) {
    files.push(filename)
  })
  .on('symlink', function(filename) {
    files.push(filename)
  })
  .on('end', function() {
    makeHashMap(callback)
  })
}
