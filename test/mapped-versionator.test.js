var appEngine
  , request = require('request')
  , versionator = require('../')
  , appEngine = require('connect')


describe('versionator', function() {

  describe('#createMapped', function() {

    it('throws an error if no map is passed', function() {

      (function() {
        versionator.createMapped()
      }).should.throw('A hash map of paths is required')

    })

    it('returns a middleware function', function() {
      versionator.createMapped({}).middleware.should.be.a('function')
    })

    describe('#versionPath', function() {
      it('should inject the mapped url correctly', function() {
        var mapped = versionator.createMapped({ '/js/test.js': '/js/HASH/test.js'})
        mapped.versionPath('/js/test.js').should.eql('/js/HASH/test.js')
      })

      it('should mapped urls with numbers', function() {
        var mapped = versionator.createMapped(
          { '/js/1test.js': '/js/HASH/1test.js'
          , '/js/a-1test.js': '/js/HASH/a-1test.js'
          })
        mapped.versionPath('/js/1test.js').should.eql('/js/HASH/1test.js')
        mapped.versionPath('/js/a-1test.js').should.eql('/js/HASH/a-1test.js')
      })

      it('should mapped urls with hyphens', function() {
        var mapped = versionator.createMapped({ '/js/test-bar.js': '/js/HASH/test-bar.js'})
        mapped.versionPath('/js/test-bar.js').should.eql('/js/HASH/test-bar.js')
      })

      it('should accept a modified map', function() {
        var mapped = versionator.createMapped({ '/js/test.js': '/js/HASH/test.js'})
        mapped.modifyMap({ '/js/test.js': '/js/OTHERHASH/test.js'})
        mapped.versionPath('/js/test.js').should.eql('/js/OTHERHASH/test.js')
      })
      it('strings without a \'/\' will be left unchanged' , function() {
        var mapped = versionator.createMapped({ '/js/test.js': '/js/HASH/test.js'})
        mapped.versionPath('Hello this is an odd path').should.eql('Hello this is an odd path')
      })

      it('should convert all urls in an array', function() {
        var mapped = versionator.createMapped(
          { '/js/test.js': '/js/HASH/test.js'
          , '/js/foo/test.js': '/js/foo/HASH/test.js'})
        mapped.versionPath(['/js/test.js', '/js/foo/test.js']).should.eql(['/js/HASH/test.js', '/js/foo/HASH/test.js'])
      })

      it('should return an empty array when passed an empty url', function() {
        var basic = versionator.createBasic('v0.0.0')
        basic.versionPath([]).should.eql([])
      })
    })

  })

  describe('mapped middleware', function() {

    function startServer(map, port) {
      var mapped = versionator.createMapped(map)
      var app = appEngine.createServer(
        mapped.middleware,
        function(req, res) {
          res.end(req.url)
        }
      )

      return {
        app: app.listen(port),
        mapped: mapped
      }
    }

    it('req.url is unchanged if no version match is found', function(done) {

      var app = startServer({}, 9900).app

      request('http://localhost:9900/images/sprite.png', function(error, response, data) {
        data.should.eql('/images/sprite.png')
        app.close()
        done()
      })
    })

    it('req.url mapped url is mapped correctly', function(done) {

      var app = startServer({'/images/sprite.png': '/images/VERSIONHASH/sprite.png' }, 9901).app

      request('http://localhost:9901/images/VERSIONHASH/sprite.png', function(error, response, data) {
        data.should.eql('/images/sprite.png')
        app.close()
        done()
      })
    })

    it('req.url mapped url is mapped correctly after hash change', function(done) {

      var appObj = startServer({'/images/sprite.png': '/images/VERSIONHASH/sprite.png' }, 9902)
      var app = appObj.app
      var mapped = appObj.mapped

      mapped.modifyMap({ '/images/sprite.png': '/images/OTHERHASH/sprite.png' })

      request('http://localhost:9902/images/OTHERHASH/sprite.png', function(error, response, data) {
        data.should.eql('/images/sprite.png')
        app.close()
        done()
      })
    })

  })

})