import bluebird from 'bluebird';
import passport from 'passport';
import { Strategy } from 'passport-local';
import bcrypt from 'bcrypt';

export default function(app, PassportProvider, settings) {
    async function checkUser(req, username, password) {
        const email = username.toLowerCase();

        let [user, isLocked] = await Promise.all([
            PassportProvider.findUserForLogin('email', email),
            PassportProvider.isLockedOut('email', email)
        ]);

        if (isLocked) {
            // do absolutely nothing if locked
            return false;
        }

        // TODO: add audit log

        const checkPassword = user ? user.password : 'THISISNOTVALIDPASSWORD';
        const isValid = await bcrypt.compare(password, checkPassword);

        if (isValid) {
            await PassportProvider.clearUserLockout('email', email);

            return user;
        } else {
            const maxFailTries = parseInt(settings.maxFailTries, 10);
            const maxLockTime = parseInt(settings.maxLockTime, 10);

            await PassportProvider.incrementLockOut('email', email, maxFailTries, function(failedCount) {
                return Math.min(
                    maxLockTime,
                    Math.pow(failedCount - maxFailTries, 2) * 5
                );
            });
            return false;
        }
    }

    passport.use('login', new Strategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function(req, email, password, done) {
        checkUser(req, email, password).then(function(toReturn) {
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
