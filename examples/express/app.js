var
  express = require('express'),
  stylus = require('stylus'),
  versionator = require('../../'),
  app = module.exports = express.createServer();

app.version = '0.1';

// Define a custom compile so version can be got from inside the .styl
function stylusCompile(str, path) {
  return stylus(str)
    .set('filename', path)
    .set('warn', true)
    .set('compress', true)
    .define('version', function() { return app.version; });
}

// Configuration
app.configure(function(){
  app
    .set('views', __dirname + '/views')
    .set('view engine', 'jade')
    .use(express.bodyParser())
    .use(express.methodOverride())
    .use(versionator('v' + app.version))
    .use(stylus.middleware({ 
      src: __dirname + '/public/',
      compile: stylusCompile }))
    .use(app.router)
    .use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    layout: false,
    title: 'Versionator'
  });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);