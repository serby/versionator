var url = require('url')
  , async = require('async')
  , crypto = require('crypto')
  , fs = require('fs')
  , path = require('path')
  , walk = require('walk').walk

function hash(filename, callback) {
  var md5sum = crypto.createHash('md5')

  fs.ReadStream(filename)
  .on('data', function(d) {
    md5sum.update(d)
  })
  .on('end', function() {
    callback(undefined, md5sum.digest('hex'))
  })
}

function makeHashMap (files, dirPath, callback) {
  var hashMap = Object.create(null)
  async.each(files, function(filename, fileCallback) {

    // resolve '../'s
    filename = path.resolve(filename)

    hash(filename, function(error, fileHash) {

      var urlPath = filename.substring(dirPath.length + 1)
        , normalizedPath = path.normalize('/' + urlPath).replace(/\\/g, '/')
        , pos = normalizedPath.lastIndexOf('/')

      hashMap[normalizedPath] =
        normalizedPath.substring(0, pos) + '/' + fileHash +
        normalizedPath.substring(pos) || url

      fileCallback(error)
    })
  }, function(error) {
    if (error) {
      return callback(error)
    }
    callback(undefined, hashMap)
  })
}

function getFilesList(dirPath, options, callback) {
  var files = []
  if (options.fileList) {
    for (var i in options.fileList) {
      files.push(options.fileList[i])
    }
    callback(files)
  } else {
    var followLinks = options.followLinks != null ? options.followLinks : true
    walk(dirPath, { followLinks: followLinks })
    .on('file', function(dir, stat, next) {
      files.push(dir + '/' + stat.name)
      next()
    })
    .on('end', function() {
      callback(files)
    })
  }
}

module.exports = function(dirPath, params, callback) {

  if ((callback === undefined) && (typeof params === 'function')) {
    callback = params
  }

  var options = Object.assign(
    { basePath: ''
    , hash: hash
    }, params)

  if (!dirPath) {
    return callback(new Error('Path is required'))
  }

  // resolve '../'s
  dirPath = path.resolve(dirPath)

  // trim trailing slash
  if (dirPath.substring(dirPath.length - 1) === '/') {
    dirPath = dirPath.slice(0, -1);
  }

  getFilesList(dirPath, options, function(files) {
    makeHashMap(files, dirPath, callback)
  })

}
