'use strict';

function FilterSelect($select, options) {
  var ctx = this;
  ctx.$select = $select;
  ctx.options = options || {};
  this._init();
}

FilterSelect.prototype = {
  _init: function() {
    var ctx = this;
    ctx.update();
  },
  update: function() {
    var ctx = this,
      $select = ctx.$select;

    var $options = getElementsByTagName($select, 'option');
    var valueSelected;
    var list = [];

    forEach($options, function($option) {
      var text = trim($option.innerHTML), value = $option.value;
      // fix: ie7下，option.value如果没有设置，全部都是空; 其它浏览器下，则是 option.text 的值
      value = !value && ($option.outerHTML && !/\svalue=/i.test($option.outerHTML)) ? text : value;
      list.push({
        id: value,
        value: text
      });

      if ($option.selected) {
        valueSelected = value;
      }
    });

    ctx._list = list;
    ctx._buildAutoComplete(valueSelected || '');
  },
  _buildAutoComplete: function(valueSelected) {
    var ctx = this, auto = ctx._auto;

    if (!auto) {
      var $root = ctx.$root = document.createElement('div');
      var $select = ctx.$select;

      $select.parentNode.insertBefore($root, $select);
      addClass($root, '.m-inline-select');

      var options = ctx.options;

      var callbackSelectFn = function(key, text) {
        $select.value = key;
      };
      if (options.callbackSelect) {
        var oldCallbackSelectFn = options.callbackSelect;
        options.callbackSelect = function(key, text) {
          callbackSelectFn.call(this, key, text);
          oldCallbackSelectFn.call(this, key, text);
        }
      }

      ctx._auto = auto = new AutoComplete($root, merge({
        data: options.data || function(value, callback) {
          var result = [], datas = ctx._list;
          for (var i = 0, max = datas.length; i < max; i++) {
            var item = datas[i];
            if (item.value.indexOf(value) >= 0) {
              result.push(item);
            }
          }
          callback(result);
        },
        freeInput: false,
        selectFirst: true,
        clearAtFocus: true,
        minIndex: 0
      }, options));

      css(auto.$ico, { display: 'block' });
      css($select, { display: 'none' });
    }

    auto.setValue(valueSelected);
  },
  getValue: function() {
    return this._auto.getValue();
  },
  setValue: function(val) {
    this._auto.setValue(val);
  },
  show: function() {
    this._auto.show();
  },
  hide: function() {
    this._auto.hide();
  }
};
