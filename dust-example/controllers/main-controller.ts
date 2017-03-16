import { Query, Param, Header, Body, UrlHandler, Middleware, Method } from '../../framework/';

function test1(req, res, next) {
  console.log('test1');
  next();
}
function test2(req, res, next) {
  console.log('test2');
  next();
}
function test3(req, res, next) {
  console.log('test3');
  next();
}

export default class MainController {
  @UrlHandler('/')
  @Method('get')
  @Query('world')
  @Middleware(test1)
  @Middleware(test2)
  @Middleware(test3)
  index(world, req, res) {
    res.render('hello', {world: world || '(default)World'});
  }
};
