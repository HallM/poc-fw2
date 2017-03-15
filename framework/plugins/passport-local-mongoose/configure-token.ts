import bluebird from 'bluebird';
import passport from 'passport';
import { Strategy } from 'passport-local';
import bcrypt from 'bcrypt';

import LoginLocker from './login-locker';
import RememberToken from './remember-token';

export default function(app, User, settings) {
    async function checkUser(req, email, token) {
        const lowerEmail = email.toLowerCase();

        let [user, lockInfo] = await Promise.all([
            User.findOne({
            email: lowerEmail,
            role: {$ne: 'noaccess'},
            deactivatedat: null,
            tokenexpire: {$gte: new Date()}
            }),

            LoginLocker.findOne({email: lowerEmail})
        ]);

        if (lockInfo && lockInfo.lockedUntil && new Date() <= lockInfo.lockedUntil) {
            // do absolutely nothing if locked
            return false;
        }

        const checkToken = user ? user.logintoken : 'THISISNOTVALIDPASSWORD';
        const isValid = await bcrypt.compare(token, checkToken);

        // we don't mess with the lock out with tokens, but we could
        if (!isValid) {
            return false;
        }

        user.logintoken = null;
        user.tokenexpire = null;
        await user.save();

        return user;
    }

    passport.use('token', new Strategy({
        usernameField: 'email',
        passwordField: 'token',
        passReqToCallback: true
    },
    function(req, email, token, done) {
        checkUser(req, email, token).then(function(toReturn) {
            done(null, toReturn);
            return null;
        }).catch(done);
    }));

    app.post(settings.tokenPostRoute, passport.authAndRegen('token'), function(req, res) {
        const redirectTo = (req.session.redirectto ? req.session.redirectto : null) || settings.postLoginUrl;
        res.okRedirect(redirectTo, {status: true});
    }, function(err, req, res, _next) {
        if (!req.wantsJSON) {
            req.flash(err.message);
        }
        res.okRedirect(settings.postErrorUrl, {status: false, error: err});
    });
};
