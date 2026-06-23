(function() {
  'use strict';

  var key = 'zwebFiscalCloneDavDebugLog';

  window.zwebCloneDavLog = function() {
    var list = [];
    try {
      list = JSON.parse(localStorage.getItem(key) || '[]');
    } catch (error) {
      list = [];
    }
    try {
      console.table(list);
    } catch (error) {}
    return list;
  };

  window.zwebCloneDavLogText = function() {
    try {
      return JSON.stringify(JSON.parse(localStorage.getItem(key) || '[]'), null, 2);
    } catch (error) {
      return '[]';
    }
  };

  window.zwebCloneDavLogClear = function() {
    localStorage.removeItem(key);
    return true;
  };
})();
