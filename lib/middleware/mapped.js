var url = require('url')

module.exports = function(mappedPaths) {
  var reverseMap = Object.create(null)

  if (typeof mappedPaths !== 'object') {
    throw new Error('A hash map of paths is required')
  }

  Object.keys(mappedPaths).forEach(function(url) {
    reverseMap[mappedPaths[url]] = url
  })

  function mapUrl(urlPath) {
    var urlObj = url.parse(urlPath.toString())
    urlObj.pathname = mappedPaths[urlObj.pathname] || urlPath
    return url.format(urlObj)
  }

  return {
    /**
     * This is intended to be exported as a helper for the view layer
     */
    versionPath: function(urlPath) {
      if (Array.isArray(urlPath)) {
        return urlPath.map(mapUrl)
      } else {
        return mapUrl(urlPath)
      }
    },

    modifyMap: function(someMappedPaths) {
      Object.keys(someMappedPaths).forEach(function(url) {
        mappedPaths[url] = someMappedPaths[url]
      })

      // regenerate reverseMap. DRY?
      Object.keys(mappedPaths).forEach(function(url) {
        reverseMap[mappedPaths[url]] = url
      })
    },

    middleware: function(req, res, next) {
      // We only do this on GET and HEAD requests
      if ('GET' !== req.method && 'HEAD' !== req.method) {
        return next()
      }

      var urlObj = url.parse(req.url),
        mappedPathname = reverseMap[urlObj.pathname]
      if (mappedPathname) {
        urlObj.pathname = mappedPathname
        req.url = url.format(urlObj)
      }

      next()
    }
  }
}
