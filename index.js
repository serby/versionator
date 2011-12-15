var
	url = require('url'),
	path = require('path');

module.exports = function(version) {

	if (!version) {
		throw new Error('version is required');
	}

	return function(req, res, next) {
		if (req.method !== 'GET') {
			return next();
		}

		// Ensure version is a string
		version = '' + version;

		var
			urlParts = url.parse(req.url),
			basename = path.basename(urlParts.pathname),
			dirname = path.dirname(urlParts.pathname),
			vPos = dirname.length - version.length;


		// If version isn't in path then move on.
		if (dirname.substring(vPos, vPos + version.length) !== version) {
			return next();
		}

		// Rebuild the URL without the version and set the request url.
		urlParts.pathname = path.join(dirname.substring(0, vPos), basename);
		req.url = url.format(urlParts);

		next();
	};
};
