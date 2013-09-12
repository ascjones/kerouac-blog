var kerouac = require('kerouac');
var site = kerouac();

site.set('base url', 'http://example.com/');
site.set('output', 'example.com');

site.engine('ejs', require('ejs-locals'));

site.plug(require('../../lib')('blog'));

// site.plug(require('kerouac-sitemap')());

site.generate(function(err) {
  if (err) {
    console.error(err.message);
    console.error(err.stack);
    return;
  }
});