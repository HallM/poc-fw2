import { InjectService } from '../../../service-manager/';

class AnotherComponent {
  @InjectService('req')
  req: any

  asyncme() {
    return new Promise(resolve => setTimeout(() => {
      resolve('This was async, kinda. Took 500ms to load, right? ' + this.req.hostname);
    }, 500));
  }
}

export = AnotherComponent;
