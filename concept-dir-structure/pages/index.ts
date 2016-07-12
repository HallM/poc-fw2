// import { PageUrl } from '../../framework/decorators/page-url';
// import { QueryParam } from '../../framework/decorators/req-param';
// import { InjectService } from '../../service-manager/';

class Index {
  // @InjectService('req')
  // req: any

  helloworld() {
    return 'hello world!';
  }
}

export = Index;
