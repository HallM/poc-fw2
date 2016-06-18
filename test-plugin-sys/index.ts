import { PluginManager } from '../plugin-system/';

import One from "./one";
import Two from "./two";
import Three from "./three";
import Four from "./four";
import Five from "./five";
import Six from "./six";
import Seven from "./seven";
import Eight from "./eight";
import Nine from "./nine";
import Ten from "./ten";

const pm = new PluginManager();

pm.addPlugin('one', new One());
pm.addPlugin('two', new Two());
pm.addPlugin('three', new Three());
pm.addPlugin('four', new Four());
pm.addPlugin('five', new Five());
pm.addPlugin('six', new Six());
pm.addPlugin('seven', new Seven());
pm.addPlugin('eight', new Eight());
pm.addPlugin('nine', new Nine());
pm.addPlugin('ten', new Ten());

pm.determineOrder();
pm.loadAll();
