import { PluginManager } from '../plugin-system/';

import BodyParser from "./plugins/body-parser/";
import CookieParser from "./plugins/cookie-parser/";
import ErrorRouter from "./plugins/error-router/";
import Express from "./plugins/express/";
import ExpressCompression from "./plugins/express-compression/";
import HttpSessions from "./plugins/http-sessions/";
import RouteLoader from "./plugins/route-loader/";
import StaticRoutes from "./plugins/static-routes/";
import ViewEngine from "./plugins/view-engine/";

export default class Framework {
    pluginManager: PluginManager

    constructor() {
        this.pluginManager = new PluginManager();

        this.pluginManager.addPlugin('body-parser', new BodyParser());
        this.pluginManager.addPlugin('cookie-parser', new CookieParser());
        this.pluginManager.addPlugin('error-router', new ErrorRouter());
        this.pluginManager.addPlugin('express', new Express());
        this.pluginManager.addPlugin('express-compression', new ExpressCompression());
        this.pluginManager.addPlugin('http-sessions', new HttpSessions());
        this.pluginManager.addPlugin('route-loader', new RouteLoader());
        this.pluginManager.addPlugin('static-routes', new StaticRoutes());
        this.pluginManager.addPlugin('view-engine', new ViewEngine());
    }

    start() {
        this.pluginManager.determineOrder();
        this.pluginManager.loadAll().then(() => {
            console.log('all running');
        });
    }
}
