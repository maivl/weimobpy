import Watcher from './../observer/watcher';
import { isFunc, isArr, isStr, isObj, isUndef, noop, clone  } from './../util/index';

export function initRender (vm, keys) {
  vm._init = false;
  return new Watcher(vm, function () {
    if (!vm._init) {
      keys.forEach(key => clone(vm[key]));
      vm._init = true;
    }
    let dirtyKeys = Object.keys(vm.$dirty);
    if (dirtyKeys.length) {
      console.log('setdata: ' + JSON.stringify(vm.$dirty));
      vm.$wx.setData(vm.$dirty);
      vm.$dirty = {};
    }
    return;
    if (vm.$dirty.length) {
      let dirtyData = {};
      vm.$dirty.concat(Object.keys(vm._computedWatchers || {})).forEach(k => {
        dirtyData[k] = vm[k];
      });
      vm.$dirty = [];
      console.log('setdata: ' + JSON.stringify(dirtyData));
      vm.$wx.setData(dirtyData);
    }
  }, function () {

  }, null, true);
};
