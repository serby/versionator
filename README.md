
# versionator - Static content versioning middleware for connect.

versionator was built to solve the problem of static assests getting stuck in browser and proxy caches when new version of the assets are deployed.

Without versionator this is what can happen:

You set your static content to be cached and expire in 1 months time. This gives you more capacity on your web servers and a great rating on Google Page Speed and ySlow.

You deploy your site an all is good.

Then you need to change sprite.png

You make your changes and redeploy sprite.png. The trouble now is that everyone who has looked at your site already has the old version in their browser cache. Not only that, any upstream proxies will also have a copy.

A possible solution is to rename your static assest every time you change them, but that in impractical as you also have to update all the references each time they change. If you have a single CSS sprite then this is a real pain.

A better solution is to use versionator!

## Installation

npm install versionator

## Usage

Add versionator into your middleware stack before the static middleware:

      app.version = '0.1.0';

      app.configure(function() {

      	app.use(versionator('v' + app.version))
        ....
        app.use(express.static(__dirname + '/public'));

       });

Public folder:

	public/images/sprite.png

In your HTML,CSS,JS add the version as an extra path.

e.g.
### HTML
      <script src='/js/v0.1.0/sprite.png' />

You can of course manage this with a variable if you are using templating

### Templating
      <script src='/js/v#{app.version}/app.js' />

### Jade
      script(src='/js/v#{app.version}/app.js')


versionator will strip URL path names containing the version string. req.url is then modified for all other middleware.

e.g.

     /js/v0.1.0/app.js

will become:

     /js/app.js

Now all you need to do is increment app.version each deployment (We keep ours inline with our git tags using a build tool) then site back and let your users enjoy the freshness.


## Credits
[Paul Serby](https://github.com/PabloSerbo/)

## Licence
Licenced under the [New BSD License](http://opensource.org/licenses/bsd-license.php)
