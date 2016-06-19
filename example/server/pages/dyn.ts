import { PageUrl } from '../../../framework/decorators/page-url';

import { QueryParam } from '../../../framework/decorators/req-param';

@PageUrl('/dynamicPage')
class DynComponent {
  dynamicthing() {
    return new Promise(resolve => setTimeout(function() {
      resolve('lazy loading');
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
