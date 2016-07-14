import { PageUrl } from '../../framework/decorators/page-url';
import { Query } from '../../framework/decorators/req-param';
import { InjectService } from '../../service-manager/';

class Index {
  @InjectService('req')
  req: any

  @Query('test')
  testparam: any

  helloworld(something) {
    return 'hello ' + something + '! ' + (this.testparam || '-- it was not set') + this.req.protocol;
  }
}

export = Index;
