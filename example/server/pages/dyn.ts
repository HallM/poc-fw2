import { PageUrl } from '../../../framework/decorators/page-url';

@PageUrl('/dynamicPage')
class DynComponent {
  get dynamicthing() {
    return new Promise(resolve => setTimeout(function() {
      resolve('lazy loading');
    }, 1000));
  }
  get otherthing() {
    return 'noooo';
  }
  afunction() {
    return new Promise(resolve => setTimeout(function() {
      resolve('much late');
    }, 5000));
  }
}

export = DynComponent;
