var appEngine
  , assert = require('assert')
  , request = require('request')
  , versionator = require('../')
  , appEngine = require('connect')


describe('versionator', function() {

  describe('#createBasic', function() {

    it('throws an error if no version is passed', function() {
      assert.throws(function() {
        versionator.createBasic()
      }, /version is required/)
    })

    it('returns a middleware function', function() {
      versionator.createBasic('0.0.0').middleware.should.be.type('function')
    })

    describe('#versionPath', function() {
      it('should inject the version correctly', function() {
        var basic = versionator.createBasic('v0.0.0')
        basic.versionPath('/js/test.js').should.eql('/js/v0.0.0/test.js')
      })
      it('strings without a \'/\' will be left unchanged' , function() {
        var basic = versionator.createBasic('v0.0.0')
        basic.versionPath('Hello this is an odd path').should.eql('Hello this is an odd path')
      })

      it('should convert all urls in an array', function() {
        var basic = versionator.createBasic('v0.0.0')
        basic.versionPath(['/js/test.js']).should.eql(['/js/v0.0.0/test.js'])
      })

      it('should return an empty array when passed an empty url', function() {
        var basic = versionator.createBasic('v0.0.0')
        basic.versionPath([]).should.eql([])
      })
    })

  })



  describe('basic middleware', function() {

    function startServer(port) {
      var app = appEngine.createServer(
        versionator.createBasic('v0.1.2').middleware,
        function(req, res) {
          res.setHeader('x-url', req.url)
          res.end(req.url)
        }
      )

      return app.listen(port)
    }

    it('req.url has version removed from pathname', function(done) {

      var app = startServer(9898)

      request('http://localhost:9898/images/v0.1.2/sprite.png', function(error, response, data) {
        data.should.eql('/images/sprite.png')
        app.close()
        done()
      })
    })

    it('should allow GET', function(done) {

      var app = startServer(9898)

      request.get('http://localhost:9898/images/v0.1.2/sprite.png', function(error, response, data) {
        data.should.eql('/images/sprite.png')
        app.close()
        done()
      })
    })

    it('should allow HEAD', function(done) {

      var app = startServer(9898)

      request.head('http://localhost:9898/images/v0.1.2/sprite.png', function(error, response) {
        response.headers['x-url'].should.eql('/images/sprite.png')
        app.close()
        done()
      })
    })

    it('req.url is unchanged if no version match is found', function(done) {

      var app = startServer(9899)

      request('http://localhost:9899/images/sprite.png', function(error, response, data) {
        data.should.eql('/images/sprite.png')
        app.close()
        done()
      })
    })

  })

})