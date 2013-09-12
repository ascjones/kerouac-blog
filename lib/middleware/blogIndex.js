module.exports = function() {
  
  return function(page, next) {
    var pages = page.pages;
    
    var posts = Object.keys(pages).map(function(path) {
        return pages[path];
      }).filter(function(page) {
        return page.post == true;
      });

    page.locals.posts = posts;
    next();
  }
}
