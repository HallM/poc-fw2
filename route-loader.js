'use strict';

var path = require('path');
var fs = require('fs');

var express = require('express');
var bluebird = require('bluebird');
var consolidate = require('consolidate');
var dust = consolidate.requires.dust;

var router = express.Router();

// TODO: config paths
var viewPages = path.resolve('views/pages/');
var serverPages = path.resolve('server/pages/');
var serverComponents = path.resolve('server/components/');
var extension = '.dust';

// TODO: experimenting with lazy-loading, but specifically for dev time only
// TODO: figure out how to handle errors during page loading
function wrapPage(page) {
  // var cr = bluebird.coroutine(genFn);
  return function(req, res, next) {
    var ctx = null;
    try {
      var ImplClass = require(path.resolve('server', page));
      ctx = new ImplClass();
    } catch(e) {
    }
    dust.stream(page, ctx).pipe(res);

    // cr(req, res, next)
    //   .then(function(locals) {
    //     // TODO: other sorts of returnables, like OK, ERR, REDIRECT
    //     if (req.xhr || !page) {
    //       res.send(page);
    //     } else {
    //       dust.stream(page, locals).pipe(res);
    //     }
    //   })
    //   .catch(next);
  };
}

function wrapDynamic(page) {
  var ImplClass = require(path.resolve('server', page));
  return function(req, res) {
    var ctx = new ImplClass();
    dust.stream(page, ctx).pipe(res);
  };
}

function wrapStatic(page) {
  return function(req, res) {
    dust.stream(page).pipe(res);
  };
}

function determineUrl(filepath) {
  var possibleUrl = filepath.replace(path.sep, '/');
  var parts = possibleUrl.split('/');
  var totalParts = parts.length;
  var lastpart = parts[totalParts-1].toLowerCase();

  if (lastpart === 'index') {
    // we remove the last part and use that
    parts.pop();
    return parts.join('/');
  }

  if (totalParts < 2) {
    return possibleUrl;
  }

  var nextlastpart = parts[totalParts-2].toLowerCase();

  var checkRepetition = lastpart.indexOf(nextlastpart);

  // no need to check for -1 index, the math solves that
  if (checkRepetition + nextlastpart.length === lastpart.length) {
    // then we remove the last bit, helps prevent repetition like user/createuser
    parts[totalParts-1] = parts[totalParts-1].substring(0, checkRepetition);
    return parts.join('/');
  }

  // then keep as is
  return possibleUrl;
}

function createActionRoutes(component) {
}

function loadComponentAndCreateRoutes(filepath, filefullpath) {
}

function createPageRoutes(filepath, filefullpath) {
  var extensionIndex = filepath.indexOf(extension);

  // make sure it ends in the extension we expect
  if (extensionIndex === -1 || extensionIndex + extension.length !== filepath.length) {
    // ignores things like strings file
    return;
  }

  var fileNoExt = filepath.substring(0, extensionIndex);

  var url = '/' + determineUrl(fileNoExt);

  var jsfile = fileNoExt + '.js';
  var jsfullpath = serverPages + path.sep + jsfile;

  // check if a js file exists
  var jsfstats = null;
  try {
    jsfstats = fs.lstatSync(jsfullpath);
  } catch(e) {
    // TODO: probably simple just doesnt exist
    // but could some other event cause this we should notify the user?
    jsfstats = null;
  }

  // if (!jsfstats || !jsfstats.isFile()) {
  //   console.log('static page', filepath, url);
  //   router.get(url, wrapStatic('pages/' + filepath));
  // } else {
  //   console.log('dynamic page', filepath, url, jsfullpath);
  //   router.get(url, wrapDynamic('pages/' + filepath, impl));
  // }
  console.log('create page', filepath, url);
  router.get(url, wrapPage('pages/' + fileNoExt));
}

function scanDirectory(dir, basedir, fn) {
  var dirfullpath = path.resolve(basedir, dir);
  var files = fs.readdirSync(dirfullpath);

  var directories = [];

  files.forEach(function(file) {
    var filepath = dir + file;
    var filefullpath = basedir + path.sep + filepath;
    var fstats = fs.lstatSync(filefullpath);

    if (fstats.isDirectory()) {
      directories.push(filepath);
      return;
    }
    if (!fstats.isFile()) {
      // TODO: not sure if we should let people know
      return;
    }

    fn(filepath, filefullpath);
  });

  directories.forEach(function(directory) {
    scanDirectory(directory + path.sep, basedir, fn);
  });
}

// TODO: dont crash when these directories dont exist
// scan for pages based on views (a page must have a view)
scanDirectory('', viewPages, createPageRoutes);

// scan component implementations to add action routes
// scanDirectory('', serverComponents, loadComponentAndCreateRoutes);

module.exports = router;
