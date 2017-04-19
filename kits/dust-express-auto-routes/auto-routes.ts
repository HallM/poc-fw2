import createAllStaticRoutes from './prod-auto-routes';
import createStaticHandler from './dev-auto-routes';

const handler = process.env.NODE_ENV === 'production' ? createAllStaticRoutes : createStaticHandler;

export default handler;
