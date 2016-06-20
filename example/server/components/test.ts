import { InjectService } from '../../../service-manager/';

class TestComponent {
  @InjectService('req')
  req: any

  test() {
    return 'inside component, req.protocol: ' + this.req.protocol;
  }
}

export = TestComponent;
