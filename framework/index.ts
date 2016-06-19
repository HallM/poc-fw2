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


const pm = new PluginManager();

pm.addPlugin('body-parser', new BodyParser());
pm.addPlugin('cookie-parser', new CookieParser());
pm.addPlugin('error-router', new ErrorRouter());
pm.addPlugin('express', new Express());
pm.addPlugin('express-compression', new ExpressCompression());
pm.addPlugin('http-sessions', new HttpSessions());
pm.addPlugin('route-loader', new RouteLoader());
pm.addPlugin('static-routes', new StaticRoutes());
pm.addPlugin('view-engine', new ViewEngine());

pm.determineOrder();
pm.loadAll().then(() => {
    console.log('all running');
});
