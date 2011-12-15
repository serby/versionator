var
	appEngine,
	assert = require('assert'),
	versionator = require('../'),
	request = require('request'),
	appEngine = require('connect');

describe('versionator', function() {

	describe('init', function() {

		it('throws an error if no version is passed', function() {
			assert.throws(function() {
				versionator();
			}, /version is required/);
		});

		it('returns a middleware function', function() {
			versionator('0.0.0').should.be.a('function');
		});

	});

	describe('returned middleware', function() {

		function startServer() {
			var app = appEngine.createServer(
				versionator('v0.1.2'),
				function(req, res, next) {
					res.end(req.url);
				}
			);

			app.listen(9898);
			return app;
		}

		it('req.url has version removed from pathname', function(done) {

			var app = startServer();

			request('http://localhost:9898/images/v0.1.2/sprite.png', function(error, response, data) {
				data.should.eql('/images/sprite.png');
				app.close();
				done();
			});
		});

		it('req.url is unchanged if no version match is found', function(done) {

			var app = startServer();

			request('http://localhost:9898/images/sprite.png', function(error, response, data) {
				data.should.eql('/images/sprite.png');
				app.close();
				done();
			});
		});

	});

});