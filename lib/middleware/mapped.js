module.exports = function(mappedPaths, escapedDir) {

  var reverseMap = Object.create(null);

  if (typeof mappedPaths !== 'object') {
    throw new Error('A hash map of paths is required');
  }

  Object.keys(mappedPaths).forEach(function(url) {
    reverseMap[mappedPaths[url]] = url;
  });

  return {

    /**
     * This is intended to be exported as a helper for the view layer
     */
    versionPath: function(urlPath) {

      if (!Array.isArray(urlPath)) {
        return mappedPaths[urlPath.toString()] || urlPath;
      }

      return urlPath.map(function(singleUrl) {
        return mappedPaths[urlPath.toString()] || urlPath;
      });
    },

    modifyMap: function(someMappedPaths) {

      Object.keys(someMappedPaths).forEach(function(url) {
        mappedPaths[url] = someMappedPaths[url];
      });

      // regenerate reverseMap. DRY?
      Object.keys(mappedPaths).forEach(function(url) {
        reverseMap[mappedPaths[url]] = url;
      });

    },

    middleware: function(req, res, next) {

      // We only do this on GET requests
      if (req.method !== 'GET') {
        return next();
      }
      if (escapedDir) {
        if (req.url.indexOf(escapedDir) >= 0) {
          next();
          return;
        }
      }
      req.url = reverseMap[req.url] || req.url;
      next();
    }
  };
};
