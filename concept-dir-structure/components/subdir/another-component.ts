import { InjectService } from '../../../service-manager/';

class AnotherComponent {
  @InjectService('req')
  req: any

  asyncme() {
    return new Promise(resolve => setTimeout(function() {
      resolve('This was async, kinda. Took 500ms to load, right? ' + this.req.host);
    }, 500));
  }
}

export = AnotherComponent;
