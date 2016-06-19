'use strict';

// var winston = require('winston');

function _determineLogMessage(data, defaultMessage) {
  if (!data) {
    return defaultMessage;
  } else if (data instanceof Error) {
    return data.message || defaultMessage;
  } else {
    return data.toString();
  }
}

module.exports = function(err, req, res, next) {
  var statusCode = err.status || 500;

  console.log(err);

  if (statusCode === 401) {
    return res.redirect('/admin/signin');
  }

  var view = 'errors/500';
  var defaultMessage = 'An error has occured';

  if (statusCode === 403) {
    view = 'errors/403';
    defaultMessage = 'Forbidden';
  } else if (statusCode === 404) {
    view = 'errors/404';
    defaultMessage = 'File not Found';
  } else if (statusCode >= 400 && statusCode < 500) {
    view = 'errors/400';
    defaultMessage = 'The request was invalid';
  }

  var logMessage = _determineLogMessage(err, defaultMessage);

  res.status(statusCode);
  res.render(view, {
    status: statusCode,
    message: logMessage
  });
};
