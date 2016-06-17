'use strict';

var path = require('path');
var bluebird = require('bluebird');
var express = require('express');
var consolidate = require('consolidate');

var session = require('express-session');
// var sessionStore = null;

// var MongoStore = require('connect-redis')(session);
// sessionStore = new RedisStore({
// });

var cookieParser = require('cookie-parser');
var compression = require('compression');
var bodyParser = require('body-parser');

var app = express();

var dustfork = require('./dust-fork');
dustfork.resolveImpl = function(elem) {
  return require(path.resolve('server', elem));
}

consolidate.requires.dust = dustfork;

app.engine('dust', consolidate.dust);
app.set('view engine', 'dust');
app.set('views', 'views');
// just pre-loading dustjs
try {
  consolidate.dust.render('index', {
    ext: app.get('view engine'),
    views: app.get('views'),
    cache: false
  }, function() {});
} catch(e) {
}

// compression should be before the statics and other routes
app.use(compression());

app.use(express.static('public'));

// middleware comes after statics, so we handle the statics without going thru middleware
app.use(cookieParser());
app.use(session({
  // store: sessionStore,
  secret: 'keyboardcattodo',
  resave: true,
  saveUninitialized: true
}));

// urlencoded is needed for standard forms. jquery can send urlencoded as well.
// there's also jsonencoded which is useful for other XHR requests. both can be enabled at the same time.
app.use(bodyParser.urlencoded({ extended: true }));

// load our routes file in
app.use(require(__dirname + '/route-loader'));

// set up our general 404 error handler
app.use(function(req, res, next) {
  var error = new Error('404 error occurred while attempting to load ' + req.url);
  error.status = 404;
  // pass it down to the general error handler
  next(error);
});

// the catch all and, general error handler. use next(err) to send it through this
app.use(require(__dirname + '/error-handler'));

var port = process.env.PORT || 3000;
var server = app.listen(port, function() {
  console.log('App listening on port %s', port);
});
