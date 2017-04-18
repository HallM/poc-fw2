import * as express from 'express';
import * as path from 'path';
import * as fs from 'fs';

// this one is used in production
function createAllStaticRoutes(basedir) {
  // create an express router
  const router = express.Router();

  // go through list of files and add routes for each of them
  addRoutesInDir(basedir, '/', router);

  // we return the router, even though this is async and the router is filled later
  // express is fine with this
  return router;
}

// no callback as it doesn't really matter. we don't notify anything that we are done
function addRoutesInDir(baseDir, dir, router) {
  const fullDir = path.join(baseDir, dir);

  fs.stat(fullDir, function(err, stats) {
    if (err) {
      return;
    }

    if (stats.isDirectory()) {
      fs.readdir(fullDir, function(err, files) {
        if (err) {
          return;
        }

        files.forEach(function(file) {
          addRoutesInDir(baseDir, path.join(dir, file), router);
        });
      });
    } else {
      // make sure it ends in .dust
      if (dir.lastIndexOf('.dust') !== (dir.length - 5)) {
        return;
      }

      const isIndex = dir.lastIndexOf('/index.dust') === (dir.length - 11);
      const url = isIndex ? dir.substr(0, dir.length - 11) : dir.substr(0, dir.length - 5);

      router.get(url, function(req, res) {
        res.render(fullDir)
      });
    }
  });
}

export default createAllStaticRoutes;
