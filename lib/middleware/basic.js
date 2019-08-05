var path = require('path')

module.exports = function(version) {
  if (!version) {
    throw new Error('version is required')
  }

  function versionSinglePath(urlPath) {
    urlPath = urlPath.toString()
    var pos = urlPath.lastIndexOf('/')
    if (pos !== -1) {
      return path
        .normalize(
          urlPath.substring(0, pos) + '/' + version + urlPath.substring(pos)
        )
        .replace(/\\/g, '/')
    } else {
      return urlPath
    }
  }

  return {
    /**
     * This is intended to be exported as a helper for the view layer
     */
    versionPath: function(urlPath) {
      if (!Array.isArray(urlPath)) {
        return versionSinglePath(urlPath)
      }

      return urlPath.map(function(singleUrl) {
        return versionSinglePath(singleUrl)
      })
    },

    middleware: function(req, res, next) {
      // We only do this on GET and HEAD requests
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        return next()
      }

      // Ensure version is a string
      version = '' + version

      var vPos = req.url.indexOf(version)

      // If version isn't in path then move on.
      if (vPos === -1) {
        return next()
      }

      // Rebuild the URL without the version and set the request url.
      req.url =
        req.url.substring(0, vPos - 1) +
        req.url.substring(vPos + version.length)
      next()
    }
  }
}
