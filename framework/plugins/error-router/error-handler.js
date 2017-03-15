'use strict';

const logger = require('winston');
const nconf = require('nconf');
const http = require('http');
const fs = require('fs');
const path = require('path');

function _determineLogMessage(data, defaultMessage) {
  if (!data) {
    return defaultMessage;
  } else if (data instanceof Error) {
    return data.message || defaultMessage;
  } else {
    return data.toString();
  }
}

module.exports = function generalErrorHandler(err, req, res, _next) {
  const statusCode = err.status || 500;
  res.status(statusCode);

  if (statusCode === 401) {
    if (req.xhr) {
      return res.send('You must be logged in');
    }
    req.session.redirectto = req.path;
    return res.redirect(nconf.get('redirectOn401'));
  }

  const defaultMessage = http.STATUS_CODES[statusCode] || http.STATUS_CODES[500];

  // check if the view file exists and use that
  // if not, check if view.substring(0, end-2) + 'xx' exists and use that
  // if not, then check if error/error.dust exists and use that
  // if not, then just send the message

  const logMessage = _determineLogMessage(err, defaultMessage);

  if (statusCode >= 500 || statusCode === 400) {
    logger.warn(logMessage);
    logger.warn(err);
  }

  if (req.xhr) {
    return res.send(logMessage);
  }
  if (req.method.toLowerCase() === 'post') {
    req.flash('error', logMessage);
    let redirectTo = err.redirectTo || req.url;
    res.redirect(redirectTo);
    return;
  }

  // take the URL, ignoring the first slash
  // split it into parts
  // ignore the last part and focus on just the directories
  // keep popping dirs off until you get to /
  // so a 503 on /blog/blah would try:
  //   - views/blog/errors/503.dust
  //   - views/blog/errors/5xx.dust
  //   - views/errors/503.dust
  //   - views/errors/5xx.dust

  const statusCodePage = `errors/${statusCode}`;
  const codeGroupPage = statusCodePage.substr(0, statusCodePage.length - 2) + 'xx';
  let possibleViews = err.showView ? [err.showView] : [];

  const url = req.path.substring(1);

  let slashIndex = url.lastIndexOf('/');
  while (slashIndex !== -1) {
    let pathpart = url.substring(0, slashIndex + 1);
    possibleViews.push(pathpart + statusCodePage);
    possibleViews.push(pathpart + codeGroupPage);
    possibleViews.push(pathpart + 'errors/error');

    slashIndex = url.lastIndexOf('/', slashIndex - 1);
  }
  // now add the ones for the "root" part
  possibleViews.push(statusCodePage);
  possibleViews.push(codeGroupPage);
  possibleViews.push('errors/error');

  const viewsDir = path.resolve(process.cwd(), req.app.get('views'));
  findExistingErrorPage(viewsDir, possibleViews, function(_err, view) {
    if (!view) {
      res.send(logMessage);
      return;
    }

    res.render(view, {
      status: statusCode,
      defaultMessage: defaultMessage,
      message: logMessage,
      error: err
    });
  });

};

// never returns errors, because we are trying to handle an error anyway
// will default to returning no page (undefined) if all possibleViews encounter errors
function findExistingErrorPage(viewsDir, possibleViews, done) {
  if (possibleViews.length) {
    const view = possibleViews.shift();
    const viewPath = path.resolve(viewsDir, view + '.dust');

    fs.access(viewPath, fs.constants.R_OK, (err) => {
      if (err) {
        // if cannot access that one, then try the next one
        findExistingErrorPage(viewsDir, possibleViews, done);
        return;
      }

      done(null, view);
    });
    return;
  }

  // nothing found
  done();
}
