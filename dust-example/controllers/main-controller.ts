import { Query, Param, Header, Body } from '../../framework/decorators/req-param';
import { UrlHandler } from '../../framework/decorators/url-handler';
import { Middleware } from '../../framework/decorators/middleware';
import { Method } from '../../framework/decorators/method';

export default class MainController {
  @UrlHandler('/')
  index(req, res) {
    res.render('hello', {world: 'World'});
  }
};
