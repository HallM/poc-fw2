import { WaitOn, Block } from '../plugin-system/';

export default class Four {
    @WaitOn('one:test')
    test() {
        console.log('four:test');
    }
}
