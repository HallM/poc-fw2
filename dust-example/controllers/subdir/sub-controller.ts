import { UrlHandler, Method } from '../../../bundle-kits/express-dust-kit/';

export default class MainController {
  @UrlHandler('/')
  @Method('get')
  index(req, res) {
    res.render('hello', {world: 'subdir/index'});
  }

  @UrlHandler('/test')
  @Method('get')
  test(req, res) {
    res.render('hello', {world: 'subdir/test'});
  }
};
