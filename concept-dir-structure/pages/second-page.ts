// import { PageUrl } from '../../framework/decorators/page-url';
// import { QueryParam } from '../../framework/decorators/req-param';
// import { InjectService } from '../../service-manager/';

class SecondPage {
  // @InjectService('req')
  // req: any

  helloworld() {
    return new Promise(resolve => setTimeout(function() {
      resolve('Async test');
    }, 1000));
  }
}

export = SecondPage;
