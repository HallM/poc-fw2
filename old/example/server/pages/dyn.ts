import { PageUrl } from '../../../framework/decorators/page-url';
import { QueryParam } from '../../../framework/decorators/req-param';
import { InjectService } from '../../../service-manager/';

@PageUrl('/dynamicPage')
class DynComponent {
  @InjectService('req')
  req: any

  dynamicthing() {
    const v = this.req.hostname;
    return new Promise(resolve => setTimeout(function() {
      resolve('lazy loading on host: ' + v);
    }, 1000));
  }
  otherthing() {
    return 'noooo';
  }
  afunction(@QueryParam('test') test) {
    return new Promise(resolve => setTimeout(function() {
      resolve('much late ' + test);
    }, 1000));
  }
}

export = DynComponent;
