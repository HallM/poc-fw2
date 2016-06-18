import { WaitOn, Block } from '../plugin-system/';

export default class Nine {
    @Block('ten:test')
    @WaitOn('six:test')
    @WaitOn('seven:test')
    test() {
        console.log('nine:test');
    }
}
