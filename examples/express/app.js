var express = require('express')
var stylus = require('stylus')
var versionator = require('../../')
const path = require('path')
var app = (module.exports = express.createServer())

app.version = '0.1'

// Configuration
app.configure(function() {
  var basic = versionator.createBasic('v' + app.version)

  app.locals({
    versionPath: basic.versionPath
  })

  // Define a custom compile so version can be got from inside the .styl
  function stylusCompile(str, path) {
    return stylus(str)
      .set('filename', path)
      .set('warn', true)
      .set('compress', true)
      .define('versionPath', function(urlPath) {
        return new stylus.nodes.Literal(
          'url(' + basic.versionPath(urlPath) + ')'
        )
      })
  }

  app
    .set('views', path.join(__dirname, '/views'))
    .set('view engine', 'jade')
    .use(express.bodyParser())
    .use(express.methodOverride())
    .use(basic.middleware)
    .use(
      stylus.middleware({
        src: path.join(__dirname, '/public/'),
        compile: stylusCompile
      })
    )
    .use(app.router)
    .use(
      express.static(path.join(__dirname, '/public'), { maxAge: 2592000000 })
    )
})

app.configure('development', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
})

// Routes

app.get('/', function(req, res) {
  res.render('index', {
    layout: false,
    title: 'Versionator'
  })
})

app.listen(3000)
console.log(
  'Express server listening on port %d in %s mode',
  app.address().port,
  app.settings.env
)
