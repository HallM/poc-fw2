import { WaitOn, Block } from '../plugin-system/';

export default class Eight {
    @WaitOn('three:test')
    test() {
        console.log('eight:test');
    }
}
