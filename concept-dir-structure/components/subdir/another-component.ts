// import { PageUrl } from '../../framework/decorators/page-url';
// import { QueryParam } from '../../framework/decorators/req-param';
// import { InjectService } from '../../service-manager/';

class AnotherComponent {
  // @InjectService('req')
  // req: any

  asyncme() {
    return new Promise(resolve => setTimeout(function() {
      resolve('This was async, kinda. Took 500ms to load, right?');
    }, 500));
  }
}

export = AnotherComponent;
