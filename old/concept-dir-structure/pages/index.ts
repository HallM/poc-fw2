import { PageUrl } from '../../framework/decorators/page-url';
import { Query } from '../../framework/decorators/req-param';
import { Inject } from '../../system-manager/';

class Index {
  @Inject('req')
  req: any

  @Query('test')
  testparam: any

  helloworld(something) {
    return 'hello ' + something + '! ' + (this.testparam || '-- it was not set') + this.req.protocol;
  }
}

export = Index;
