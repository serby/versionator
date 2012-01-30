var
	appEngine,
	assert = require('assert'),
	request = require('request'),
	versionator = require('../'),
	appEngine = require('connect');

describe('versionator', function() {

	describe('#createBasic', function() {

		it('throws an error if no version is passed', function() {
			assert.throws(function() {
				versionator.createBasic();
			}, /version is required/);
		});

		it('returns a middleware function', function() {
			versionator.createBasic('0.0.0').middleware.should.be.a('function');
		});

	});

	describe('basic middleware', function() {

		function startServer() {
			var app = appEngine.createServer(
				versionator.createBasic('v0.1.2').middleware,
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