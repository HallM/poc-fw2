import { WaitOn, Block } from '../plugin-system/';

export default class Ten {
    @WaitOn('three:test')
    test() {
        console.log('ten:test');
    }
}
