/**
 * Module dependencies.
 */
var fs = require('fs')
  , path = require('path')
  , kerouac = require('kerouac')
  , middleware = require('./middleware')
  , utils = require('./utils');

var DASHED_REGEX = /^(\d+)-(\d+)-(\d+)-(.*)/
  , UNDASHED_REGEX = /^(\d{4})(\d{2})(\d{2})-(.*)/


exports = module.exports = function(dir, pattern, options) {
  if (typeof pattern == 'object') {
    options = pattern;
    pattern = undefined;
  }
  if (typeof dir == 'object') {
    options = dir;
    pattern = undefined;
    dir = undefined;
  }
  dir = dir || 'blog';
  pattern = pattern || '/blog/:year/:month/:day/:slug.html';
  options = options || {};
  
  
  var keys = [];
  var regexp = utils.pathRegexp(pattern
    , keys
    , options.sensitive
    , options.strict);

  var indexFile = undefined;
  
  return function blog(site, pages) {
    var files = fs.readdirSync(dir);
    
    for (var i = 0, len = files.length; i < len; ++i) {
      var filename = files[i]
        , basename = path.basename(filename, path.extname(filename))
        , file = path.resolve(dir, filename)
        , params = {}
        , match
        , url;

      if (basename === 'index') {
        indexFile = file;
        continue;
      }
        
      if (match = DASHED_REGEX.exec(basename)) {
        params.year = match[1];
        params.month = match[2];
        params.day = match[3];
        params.slug = match[4];
      } else if (match = UNDASHED_REGEX.exec(basename)) {
        params.year = match[1];
        params.month = match[2];
        params.day = match[3];
        params.slug = match[4];
      }
      
      url = utils.patternSubstitute(pattern, keys, params);

      var setPrettyURL= function(page, next) {
        page.prettyURL = page.url.substring(0,page.url.lastIndexOf('/') + 1);
        next();
      }
      
      // TODO: Make prettyURLs optional (possible passing it as an argument).
      site.page(url, kerouac.prettyURL()
                   , kerouac.url()
                   , setPrettyURL
                   , kerouac.loadContent(file)
                   , middleware.mergeLocals(params, options.layout)
                   , middleware.init()
                   , kerouac.render());
    }

    // TODO: Use the non-substitutable portion of `pattern` to determine this.
    site.page('/blog/feed.rss', kerouac.url()
                              , middleware.rss2());

    if (indexFile) {
      site.page('/blog/index.html'
        , kerouac.prettyURL()
        , kerouac.url()
        , kerouac.loadContent(indexFile)
        , middleware.blogIndex()
        , kerouac.render());
    }
  }
}
