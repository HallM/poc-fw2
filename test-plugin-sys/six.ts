import { WaitOn, Block } from '../plugin-system/';

export default class Six {
    @WaitOn('two:test')
    test() {
        console.log('six:test');
    }
}
