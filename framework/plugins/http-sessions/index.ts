/// <reference path="../../_all.d.ts" />

'use strict';

import { Event, WaitOn, Block } from '../../../plugin-system/';

var session = require('express-session');

export default class HttpSessions {
    @Event
    @WaitOn('express:load')
    @WaitOn('cookie-parser:load')
    @WaitOn('static-routes:load')
    load(app) {
        console.log('load sessions');
        app.use(session({
            // store: sessionStore,
            secret: 'keyboardcattodo',
            resave: true,
            saveUninitialized: true
        }));
    }
}
