import { UrlHandler, Method } from '../../../framework/';

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
