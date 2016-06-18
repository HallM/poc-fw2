import { WaitOn, Block } from '../plugin-system/';

export default class Seven {
    @WaitOn('three:test')
    test() {
        console.log('seven:test');
    }
}
