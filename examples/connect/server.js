var version = '0.1'
  , connect = require('connect')
  , versionator = require('../../')
  ;

connect(
  versionator.createBasic('v' + version).middleware,
  connect.static(__dirname + '/public', { maxAge: 2592000000 }),
  function(req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.end('<script src="/js/v' + version + '/example.js"></script>');
  }
).listen(3000);