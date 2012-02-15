var
	appEngine,
	assert = require('assert'),
	request = require('request'),
	versionator = require('../'),
	appEngine = require('connect');

describe('versionator', function() {

	describe('#createMapped', function() {

		it('throws an error if no map is passed', function() {
			
			(function() {
				versionator.createMapped();
			}).should.throw('A hash map of paths is required');

		});

		it('returns a middleware function', function() {
			versionator.createMapped({}).middleware.should.be.a('function');
		});

		describe('#versionPath', function() {	
			it('should inject the mapped url correctly', function() {
				var mapped = versionator.createMapped({ '/js/test.js': '/js/HASH/test.js'});
				mapped.versionPath('/js/test.js').should.eql('/js/HASH/test.js');	
			});
			it('should accept a modified map', function() {
				var mapped = versionator.createMapped({ '/js/test.js': '/js/HASH/test.js'});
				mapped.modifyMap({ '/js/test.js': '/js/OTHERHASH/test.js'});
				mapped.versionPath('/js/test.js').should.eql('/js/OTHERHASH/test.js');	
			});
			it('strings without a \'/\' will be left unchanged' , function() {
				var mapped = versionator.createMapped({ '/js/test.js': '/js/HASH/test.js'});
				mapped.versionPath('Hello this is an odd path').should.eql('Hello this is an odd path');	
			});
		});

	});

	describe('mapped middleware', function() {

		function startServer(map) {
		    var mapped = versionator.createMapped(map)
			var app = appEngine.createServer(
				mapped.middleware,
				function(req, res, next) {
					res.end(req.url);
				}
			);

			app.listen(9898);
			return {'app': app, 'mapped': mapped};
		}

		it('req.url is unchanged if no version match is found', function(done) {

			var app = startServer({}).app;

			request('http://localhost:9898/images/sprite.png', function(error, response, data) {
				data.should.eql('/images/sprite.png');
				app.close();
				done();
			});
		});

		it('req.url mapped url is mapped correctly', function(done) {

			var app = startServer({'/images/sprite.png': '/images/VERSIONHASH/sprite.png' }).app;

			request('http://localhost:9898/images/VERSIONHASH/sprite.png', function(error, response, data) {
				data.should.eql('/images/sprite.png');
				app.close();
				done();
			});
		});

		it('req.url mapped url is mapped correctly after hash change', function(done) {

			var appObj = startServer({'/images/sprite.png': '/images/VERSIONHASH/sprite.png' });
            var app = appObj.app;
            var mapped = appObj.mapped;
            
            mapped.modifyMap({ '/images/sprite.png': '/images/OTHERHASH/sprite.png' });

			request('http://localhost:9898/images/OTHERHASH/sprite.png', function(error, response, data) {
				data.should.eql('/images/sprite.png');
				app.close();
				done();
			});
		});

	});

});