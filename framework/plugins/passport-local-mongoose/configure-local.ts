import bluebird from 'bluebird';
import passport from 'passport';
import { Strategy } from 'passport-local';
import bcrypt from 'bcrypt';

import LoginLocker from './login-locker';
import RememberToken from './remember-token';

export default function(app, User, settings) {
  passport.use('login', new Strategy({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
  },
  function(req, email, password, done) {
      bluebird.coroutine(function*() {
          const lowerEmail = email.toLowerCase();

          let [user, lockInfo] = yield Promise.all([
              User.findOne({
                  email: lowerEmail,
                  role: {$ne: 'noaccess'},
                  deactivatedat: null
              }),

              LoginLocker.findOne({email: lowerEmail})
          ]);

          if (lockInfo && lockInfo.lockedUntil && new Date() <= lockInfo.lockedUntil) {
              // do absolutely nothing if locked
              return false;
          }

          // TODO: add audit log

          const checkPassword = user ? user.password : 'THISISNOTVALIDPASSWORD';
          const isValid = yield bcrypt.compare(password, checkPassword);

          if (isValid) {
              if (lockInfo) {
                  lockInfo.failedCount = 0;
                  yield lockInfo.save();
              }

              return user;
          } else {
              if (!lockInfo) {
                  lockInfo = new LoginLocker();
              }
              // TODO: can we make this atomic?
              lockInfo.failedCount += 1;

              const maxFailTries = parseInt(settings.maxFailTries, 10);
              const maxLockTime = parseInt(settings.maxLockTime, 10);
              if (lockInfo.failedCount > maxFailTries) {
                  lockInfo.lockedUntil = Math.min(
                      maxLockTime,
                      Math.pow(lockInfo.failedCount - maxFailTries, 2) * 5
                  );
              }

              yield lockInfo.save();
              return false;
          }
      })().then(function(toReturn) {
          done(null, toReturn);
          return null;
      }).catch(done);
  }));

  app.post(settings.loginPostRoute, passport.authAndRegen('local'), function(req, res) {
      const redirectTo = (req.session.redirectto ? req.session.redirectto : null) || settings.postLoginUrl;
      res.okRedirect(redirectTo, {status: true});
  }, function(err, req, res, _next) {
      if (!req.wantsJSON) {
          req.flash(err.message);
      }
      res.okRedirect(settings.postErrorUrl, {status: false, error: err});
  });

};
