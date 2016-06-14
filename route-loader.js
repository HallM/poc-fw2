'use strict';

var path = require('path');
var fs = require('fs');

var express = require('express');
var bluebird = require('bluebird');

var router = express.Router();

var viewPages = path.resolve('views/pages/');
var serverPages = path.resolve('server/pages/');
var extension = '.dust';

function wrap(page, genFn) {
  var cr = bluebird.coroutine(genFn);
  return function(req, res, next) {
    cr(req, res, next)
      .then(function(locals) {
        res.render(page, locals);
      })
      .catch(next);
  };
}

function renderStaticPage(page, locals) {
  return function(req, res) {
    res.render(page, locals);
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

function createRoutesInDir(dir) {
  var dirfullpath = path.resolve(viewPages, dir);
  var files = fs.readdirSync(dirfullpath);

  var directories = [];

  files.forEach(function(file) {
    var filepath = dir + file;
    var filefullpath = viewPages + path.sep + filepath;
    var fstats = fs.lstatSync(filefullpath);

    if (fstats.isDirectory()) {
      directories.push(filepath);
      return;
    }
    if (!fstats.isFile()) {
      return;
    }

    var extensionIndex = filepath.indexOf(extension);

    // make sure it ends in the extension we expect
    if (extensionIndex === -1 || extensionIndex + extension.length !== filepath.length) {
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
      jsfstats = null;
    }

    if (!jsfstats || !jsfstats.isFile()) {
      // create static route
      console.log('static page', filepath, url);
      router.get(url, renderStaticPage('pages/' + filepath));
    } else {
      console.log('dynamic page', filepath, url, jsfullpath);
      var fn = require(jsfullpath);
      // create dynamic route
      router.get(url, wrap('pages/' + filepath, fn));
    }
  });

  directories.forEach(function(directory) {
    createRoutesInDir(directory + path.sep);
  });
}

createRoutesInDir('');

module.exports = router;
