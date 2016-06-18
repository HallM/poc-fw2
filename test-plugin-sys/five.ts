import { WaitOn, Block } from '../plugin-system/';

export default class Five {
    @WaitOn('two:test')
    test() {
        console.log('five:test');
    }
}
