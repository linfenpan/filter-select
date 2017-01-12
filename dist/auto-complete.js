/*! by da宗熊 MIT v1.0.0 update:2017/1/12 git:https://github.com/linfenpan/filter-select */

;(function(ctx, name, defination) {
  ctx[name] = defination(ctx);
})(window, 'AutoComplete', function(win) {

var NOT_f1 = void 0;

function noop() {}

function getElementsByTagName($r, tag, i) {
  var $elems = $r.getElementsByTagName(tag);
  return i === NOT_f1 ? $elems : $elems[i];
}
function attr($r, name, val) {
  if (val === NOT_f1) {
    return $r.getAttribute(name);
  } else {
    $r.setAttribute(name, val);
  }
}
function css($r, name) {
  if (typeof name === 'string') {
    return $r.style[name];
  } else {
    var obj = name;
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        $r.style[key] = obj[key];
      }
    }
  }
}
function removeClass($r, cls) {
  $r.className = $r.className.replace(new RegExp('\\s*\\b' + cls + '\\b', 'g'), '');
}
function hasClass($r, cls) {
  return new RegExp('\\b' + cls + '\\b').test($r.className);
}
function addClass($r, cls) {
  if (!hasClass($r, cls)) {
    $r.className += ' ' + cls;
  }
}
function forEach(list, fn) {
  for (var i = 0, max = list.length; i < max; i++) {
    fn.call(list, list[i], i);
  }
}
function indexOf(list, value) {
  for (var i = 0, max = list.length; i < max; i++) {
    if (list[i] === value) {
      return i;
    }
  }
  return -1;
}
function merge() {
  var args = [].slice.call(arguments, 0);
  var obj = args[0];
  for (var i = 1, max = args.length; i < max; i++) {
    var item = args[i];
    for (var key in item) {
      if (item.hasOwnProperty(key)) {
        obj[key] = item[key];
      }
    }
  }
  return obj;
}
function trim(str) {
  return str.replace(/^\s*|\s*$/g, '');
}
function addEvent($r, evt, fn) {
  if (window.addEventListener) {
    $r.addEventListener(evt, fn, false);
  } else {
    $r.attachEvent('on' + evt, fn);
  }
}
function removeEvent($r, evt, fn) {
  if (window.removeEventListener) {
    $r.removeEventListener(evt, fn, false);
  } else {
    $r.detachEvent('on' + evt, fn);
  }
}



var CLASS_f2 = 'm-list-item-active';

function AutoComplete($root, options) {
  var ctx = this;
  ctx.$root = $root;

  options = ctx.options = merge({
    data: function(value, callback) { callback([]); },
    callbackSelect: noop,
    callbackChange: noop,
    callbackShow: noop,
    callbackHide: noop,
    clearAtFocus: true,
    resetOnHide: true,
    placeholder: '请选择',
    defaultValue: '',
    defaultText: '',
    selectFirst: true,
    freeInput: true,
    minIndex: -1
  }, options || {});

  $root.innerHTML = [
    '<div class="m-placeholder" style="display:none;"></div>',
    '<input type="text" class="m-input" autocomplete="off" disableautocomplete value="" />',
    '<input type="hidden" class="m-input-hidden" autocomplete="off" disableautocomplete value="" />',
    '<span class="m-input-ico" style="display:none;"></span>',
    '<ul class="m-list" style="display:none;"></ul>'
  ].join('');
  addClass($root, 'm-input-select');

  ctx.$input = getElementsByTagName($root, 'input', 0);
  ctx.$value = getElementsByTagName($root, 'input', 1);
  ctx.$tip = getElementsByTagName($root, 'div', 0);
  ctx.$ico = getElementsByTagName($root, 'span', 0);
  ctx.$ul = getElementsByTagName($root, 'ul', 0);

  ctx._f3 = options.minIndex;
  ctx._f4 = options.defaultText;
  ctx._f5 = options.defaultValue;

  ctx._f6();
}

AutoComplete.prototype = {
  _f6: function() {
    var ctx = this;
    ctx.reset();
    ctx._f7();
  },

  reset: function() {
    var ctx = this;
    ctx._f8 = 0;
    ctx.isShow = false;
    ctx.setPlaceholder(ctx.options.placeholder);
    ctx._f9();
    css(ctx.$ul, { display: 'none' });

    var options = ctx.options,
      defaultText = options.defaultText,
      defaultValue = options.defaultValue;
    ctx.$input.value = defaultText;
    ctx.$value.value = defaultValue;
    if (defaultText) {
      ctx.setPlaceholder(defaultText);
    }
  },

  setPlaceholder: function(text) {
    this.$tip.innerHTML = text;
  },

  _f10: function() {
    css(this.$tip, { display: 'none' });
  },

  _f9: function() {
    css(this.$tip, { display: 'block' });
  },

  _f7: function() {
    var ctx = this, options = ctx.options;
    var $input = ctx.$input;

    function canShow() {
      return !ctx.isDisabled();
    }

    addEvent(ctx.$ul, 'click', function(e) {
      var target = e.srcElement || e.target,
        name = target.tagName.toLowerCase();
      if (name == 'li') {
        ctx._f11(target);
        ctx.hide();
      }
    });

    // 绑定小三角的点击
    addEvent(ctx.$ico, 'click', function() {
      if (!canShow()) { return; }
      if (ctx.isShow) {
        ctx.hide();
      } else {
        $input.focus();
        ctx.show();
      }
    });

    // 绑定input的选中
    addEvent($input, 'focus', function(e) {
      if (!canShow()) { return; }
      if (options.clearAtFocus) {
        $input.value = '';
      }
      ctx.show();
      changeInput.call(this, e);
    });

    // 绑定input的键盘事件
    addEvent($input, 'keydown', function(e) {
      if (!canShow()) { return; }

      var hadChagned = false;
      var shouldStopDefault = false;
      switch(e.keyCode){
        case 38:
          ctx.prev();
          hadChagned = true;
          break;
        case 40:
          ctx.next();
          hadChagned = true;
          break;
        case 13:
          ctx._f11(ctx.$lis[ctx._f12()]);
          ctx.hide();
          shouldStopDefault = true;
          break;
      }

      if (hadChagned) {
        options.callbackChange(ctx._f8);
      }

      if (hadChagned || shouldStopDefault) {
        if (e.preventDefault) {
          e.preventDefault();
        } else {
          (e || window.event).returnValue = false;
        }
        return false;
      }
    });

    // input 过滤内容
    addEvent($input, 'input', changeInput);
    // fix: 低版本Ie，不支持input事件，而又因为更改了 $input 的属性，所有导致此方法，被触发了一轮
    setTimeout(function() {
      addEvent($input, 'propertychange', changeInput);
    }, 200);
    function changeInput(e, a) {
      if (e.propertyName && e.propertyName.toLowerCase() != 'value') {
        return;
      }
      if (!canShow()) { return; }
      var value = trim($input.value);
      if (value) {
        ctx._f10();
      } else {
        ctx._f9();
      }

      ctx._f13(value);
      ctx._f14();
      if (!ctx.isShow) {
        ctx.show();
      }
    }
  },

  _f13: function(value) {
    var ctx = this, options = ctx.options, freeInput = options.freeInput;
    var list = [];
    options.data.call(this, value, function(datas) {
      forEach(datas, function(item) {
        list.push('<li class="m-list-item" data-value="'+ (freeInput ? item.value : item.id) +'">'+ item.value +'</li>');
      });
      var $ul = ctx.$ul;
      $ul.innerHTML = list.join('');
      ctx.$lis = getElementsByTagName($ul, 'li');
      ctx.length = ctx.$lis.length;
    });
  },

  _f14: function(indexSelected) {
    var ctx = this;
    // 索引修正为滚动索引
    indexSelected = indexSelected || ctx._f15();
    if (ctx.options.selectFirst) {
      indexSelected = indexSelected < 0 ? 0 : indexSelected;
    }
    ctx._f8 = indexSelected;

    var $li = ctx.$lis[ctx._f8];
    if ($li) {
      addClass($li, CLASS_f2);
      ctx._f16();
    }
  },

  _f16: function() {
    var ctx = this, $ul = ctx.$ul, $lis = ctx.$lis;
    var index = ctx._f12();
    $ul.scrollTop = index >= 0 && $lis[0] ? $lis[0].clientHeight * index : 0;
  },

  _f17: function(index) {
    var ctx = this,
      $lis = ctx.$lis,
      length = $lis.length;

    var minIndex = ctx._f3;

    if (index <= minIndex) {
      index = minIndex;
    } else if (index >= length) {
      index = length - 1;
    }

    // 找出当前active的元素，删掉 active
    var indexCurrent = ctx._f12();
    if (indexCurrent >= 0) {
      removeClass($lis[indexCurrent], CLASS_f2);
    }

    // 然后找出下一个需要添加 active 的元素
    var $li = $lis[index];
    if ($li) {
      addClass($li, CLASS_f2);
      ctx._f16();
    }
    ctx._f8 = index;
  },

  _f11: function($li) {
    var ctx = this, text, value;
    if ($li) {
      text = $li.innerHTML,
      value = attr($li, 'data-value');
    } else {
      if (ctx.options.freeInput) {
        value = ctx.$input.value;
      } else {
        value = ctx.$value.value;
      }
    }
    ctx.setValue(value);
  },

  _f12: function() {
    var ctx = this, index = -1;
    for (var i = 0; i < ctx.length; i++) {
      var $li = ctx.$lis[i];
      if (hasClass($li, CLASS_f2)) {
        return i;
      }
    }
    return index;
  },

  _f15: function() {
    var ctx = this,
      index = -1,
      value = ctx.getValue();
    for (var i = 0; i < ctx.length; i++) {
      var $li = ctx.$lis[i];
      if (value == attr($li, 'data-value') && css($li, 'display') != 'none') {
        return i;
      }
    }
    return index;
  },

  next: function() {
    return this._f17(this._f8 + 1);
  },

  prev: function() {
    return this._f17(this._f8 - 1);
  },

  hide: function() {
    var ctx = this;

    css(ctx.$ul, { display: 'none' });
    ctx._f10();

    if (ctx.options.resetOnHide) {
      ctx.setValue(ctx.$value.value);
    }

    ctx._f18();
    ctx._f19 && ctx._f19();
    ctx.isShow && ctx.options.callbackHide.call(ctx);
    ctx.isShow = false;
  },

  show: function(indexSelected) {
    var ctx = this;
    css(ctx.$ul, { display: 'block' });

    // 绑定 body 元素的点击，隐藏掉$ul
    ctx._f20();
    !ctx.isShow && ctx.options.callbackShow.call(ctx);
    ctx.isShow = true;
  },

  getValue: function() {
    return trim(this.$value.value);
  },

  setValue: function(value) {
    var ctx = this;
    ctx.$value.value = value;
    if (value) {
      ctx._f10();
    }

    if (ctx.$lis) {
      var $curLi = ctx.$lis[ctx._f12()];
      if ($curLi) {
        removeClass($curLi, CLASS_f2);
      }
    }

    var hasFindInLi = false;
    for (var i = 0, max = ctx.length; i < max; i++) {
      var $li = ctx.$lis[i], _f21 = attr($li, 'data-value');
      if (_f21 == value) {
        addClass($li, CLASS_f2);
        ctx._f22(trim($li.innerHTML));
        hasFindInLi = true;
        break;
      }
    }
    // value 值，不存在 data-value 属性中
    if (!hasFindInLi) {
      ctx._f22(value);
    }

    if (ctx._f5 != value) {
      ctx._f18();
    }
  },

  _f22: function(text) {
    var ctx = this, $input = ctx.$input, placeholder = ctx.options.placeholder;
    if (text === placeholder) {
      text = '';
    } else if (text) {
      placeholder = text;
    }
    $input.value = text;
    ctx.setPlaceholder(placeholder);
    text ? ctx._f10() : ctx._f9();
  },

  setDisabled: function(disabled) {
    this.$input.disabled = disabled;
  },

  isDisabled: function() {
    var $input = this.$input;
    return $input.disabled || $input.readOnly;
  },

  _f20: function() {
    var ctx = this, eventName = 'mouseup';
    var $body = document.getElementsByTagName('body')[0];
    function remove() {
      removeEvent($body, eventName, hide);
    }
    function hide(e) {
      if (!ctx.$ul) {
        return remove();
      }
      var target = e.srcElement || e.target;
      if (target.tagName.toLowerCase() === 'li') {
        target = target.parentNode;
      }
      if (target != ctx.$input && target != ctx.$ico && target != ctx.$ul) {
        ctx.hide();
        remove();
      }
    }
    function listen() {
      remove();
      addEvent($body, eventName, hide);
    }
    ctx._f19 = remove;
    ctx._f20 = listen;
    listen();
  },

  _f18: function() {
    var ctx = this,
      value = ctx.getValue();
    if (ctx._f5 !== value) {
      ctx._f5 = value;
      ctx.options.callbackSelect(value, trim(ctx.$input.value));
    }
  }
};



    return AutoComplete;
});