# versionator - Static content versioning middleware for connect and express.

[![Join the chat at https://gitter.im/serby/versionator](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/serby/versionator?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![build status](https://secure.travis-ci.org/serby/versionator.png)](http://travis-ci.org/serby/versionator)

versionator was built to solve the problem of static assets getting stuck in browser and proxy caches when new versions of the assets are deployed.

Without versionator this is what can happen:

You set your static content to be cached and expire in 30 days time.

     express.static(__dirname + '/public', { maxAge: 2592000000 })

This gives you more capacity on your web servers and a better rating on Google Pagespeed and ySlow.

You deploy your site and all is good.

Then you need to make a change to sprite.png or app.js

You make your changes and redeploy. The trouble now is that everyone who has looked at your site already has the old version in their browser cache. Not only that, any upstream proxies will also have a copy.

A possible solution is to rename your static assets every time you change them, but that is impractical as you also have to update all the references each time they change. If you have a single CSS sprite then this is a real pain.

A better solution is to use versionator!

## Installation

      npm install versionator

## Usage

### Basic Middleware

The simplest way to use versionator is to use the basic middleware which looks for the given
version number in a url path and strips it out.

Add versionator into your middleware stack before the static middleware:

```js

app.version = '0.1.0';
var versionator = require('versionator').create(app.version);

app.configure(function() {

  app.use(versionator.middleware)
  ....
  .use(express.static(__dirname + '/public', { maxAge: 2592000000 }));

});

```

Public folder:

	public/js/app.js

In your HTML,CSS,JS add the version as an extra path.

e.g.
### HTML
      <script src='/js/v0.1.0/app.js' />

There is also a URL versioning local variable that will convert paths for you.
You can expose as a helper like so:

```js

app.configure(function() {

  // This exposes the local variable to the views
  app.locals({
    versionPath: versionator.versionPath
  });

});

```

### Jade

This can then be used in Jade like so

      script(src=versionPath(/js/app.js))

### Middleware

versionator middleware will strip URL path names containing the version string. req.url is then modified for all other middleware.

e.g.

     req.url = '/js/v0.1.0/app.js'

will become:

     req.url = '/js/app.js'

Now all you need to do is increment app.version each deployment (We keep ours inline with our git tags using cake, the coffee-script build tool) then sit back and let your users enjoy the freshness.

An example of how to use versionator with connect and express can be found in the examples folder.

### Mapped Middleware

You can also use versionator to add a hash, based on the content of the file, to the url path.
This way the url path will only change if the file has changed.

To do this you must first create a hash for all the files in the public folder.
This can be done as the application starts or read from a file that is created on deployment.

```js

versionator.createMapFromPath(__dirname + '/public', function(error, staticFileMap) {

  var mappedVersion = versionator.createMapped(staticFileMap);

  app.configure(function(){

    // This exposes the local variable to the views
    app.locals({
      versionPath: mappedVersion.versionPath
    });

    app
      .set('views', __dirname + '/views')
      .set('view engine', 'jade')
      .use(express.bodyParser())
      .use(express.methodOverride())
      .use(mappedVersion.middleware)
      ....
  });

  ....
});
```
If you use the helper you can switch methods without any changes to your view code.

The symlinks will be followed unless you're using the following option:

```js

versionator.createMapFromPath(__dirname + './public', { followLinks: false },
function(error, staticFileMap) { ... } )`

```

### Live map updates

You can modify the map at runtime, say if during development you want to do a live reload of a resource. First, get the hash map for the modified files by passing a list of files as a `fileList` parameter. This should be full file paths and the files should be in the original public directory. The directory is passed in as well. Then pass the the new hash map to the middleware via `modifyMap`. Then push the new url to the client and update the resource tag to cause a reload.

```js

    var mappedVersion = versionator.createMapped(originalFileMap);
    ...
    // modify resource files. put full file path(s) in a list.

    versionator.createMapFromPath(__dirname + '/public',  {'fileList': fileList}, function(error, modifiedFileMap) {
        mappedVersion.modifyMap(modifiedFileMap);
    )};

    // send new hashed path to client
    hashedpath = mappedVersion.versionPath(path)
    ...
```


## Credits

[Paul Serby](https://github.com/serby/) follow me on [twitter](http://twitter.com/PabloSerbo)

[Rick Thomas](https://github.com/irickt)

## Licence
Licenced under the [New BSD License](http://opensource.org/licenses/bsd-license.php)
