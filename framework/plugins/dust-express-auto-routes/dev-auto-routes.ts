import * as express from 'express';
import * as path from 'path';
import * as fs from 'fs';

// this one is used in dev
function createStaticHandler(basedir) {
  return function(req, res, next) {
    // also, make sure if it ends in a slash, then use index.dust
    const hasEndingSlash = req.path[req.path.length - 1] === '/';
    const urlpath = 'static/' + req.path.substr(1) + (hasEndingSlash ? 'index' : '');

    // security: make sure someone doesnt navigate out of the top folder with urlpath
    if (urlpath.indexOf('/./') !== -1 || urlpath.indexOf('/../') !== -1) {
      next();
      return;
    }

    const fallback = hasEndingSlash ? null : (urlpath + '/index');

    // check if dust file exists
    attemptRender(basedir, urlpath, fallback, function(err, toRender) {
      if (err || !toRender) {
        // if no file exists, then we call next to do the 404 handler
        next();
        return;
      }

      res.render(urlpath);
    });
  };
}

function attemptRender(basedir, urlpath, fallback, done) {
  const pagePath = path.resolve(basedir, urlpath + '.dust');

  // check if dust file exists
  fs.access(pagePath, fs.R_OK, (err) => {
    // if not, then next();
    if (err) {
      if (fallback) {
        attemptRender(basedir, fallback, null, done);
        return;
      }

      // don't actually show the error, just let the 404 take over
      done(err);
      return;
    }

    // if it does, render it
    done(null, urlpath);
  });
}

export default createStaticHandler;
