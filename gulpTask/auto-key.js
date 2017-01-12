'use strict';

module.exports = {
  getAutoKeyBuilder: function() {
    const replaceMap = {};
    let replaceIndex = 1;
    return function autoKey(key) {
      if (!replaceMap[key]) {
        replaceMap[key] = replaceIndex++;
      }
      return replaceMap[key];
    }
  }
};
