import { NotAuthorizedError } from '../../errors/notauthorized';
import { AccountLockedError } from '../../errors/accountlocked';

// passport's default behavior is not to prevent session fixation, so we do it ourselves
export default function generalLogin(req, user, done) {
    if (!user) {
        return done(new NotAuthorizedError('Invalid username or password'));
    }

    if (user.isLocked) {
        return done(new AccountLockedError('User account is locked'));
    }

    const saveRedirectTo = req.session.redirectto;

    req.session.regenerate(function() {
        req.logIn(user, function(err) {
            if (err) {
                return done(err);
            }

            // if there's anything specific about the session that needs to be stored
            req.session.startAt = new Date().getTime();
            if (saveRedirectTo) {
                req.session.redirectto = saveRedirectTo;
            }
            done();
        });
    });
};
