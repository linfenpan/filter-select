/*! by da宗熊 MIT v1.0.5 update:2020/12/11 git:https://github.com/linfenpan/filter-select */

;(function(ctx, name, defination) {
  ctx[name] = defination(ctx);
})(window, 'AutoComplete', function(win) {

var NOT_DEFINED = void 0;

function noop() {}

function getElementsByTagName($r, tag, i) {
  var $elems = $r.getElementsByTagName(tag);
  return i === NOT_DEFINED ? $elems : $elems[i];
}
function attr($r, name, val) {
  if (val === NOT_DEFINED) {
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

var CLASS_ACTIVE = 'm-list-item-active';

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
    emptyInput: false, // 允许输入空字符串吗
    changeAsSelect: false, // 索引改变后，就立即选中
    selectFirst: true,
    freeInput: true,   // freeInput = true 时，defaultValue 和 defaultText 的值，一致。defaultText 的值，覆盖掉 defaultValue 的
    minIndex: -1
  }, options || {});

  if (options.freeInput) {
    options.defaultValue = options.defaultText;
  }

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

  ctx._minIndex = options.minIndex;
  ctx._oldText = options.defaultText;
  ctx._oldValue = options.defaultValue;
  
  ctx._init();
}

AutoComplete.prototype = {
  _init: function() {
    var ctx = this;
    ctx.reset();
    ctx._bindUI();
  },

  reset: function() {
    var ctx = this;
    ctx._index = 0;
    ctx.isShow = false;
    ctx.setPlaceholder(ctx.options.placeholder);

    ctx._showPlaceholder();
    css(ctx.$ul, { display: 'none' });

    var options = ctx.options;
    var defaultValue = options.defaultValue;

    if (defaultValue != null) {
      ctx.setValue(defaultValue);
    }
  },

  setPlaceholder: function(text) {
    this.$tip.innerHTML = text;
  },

  _hidePlaceholder: function() {
    css(this.$tip, { display: 'none' });
  },

  _showPlaceholder: function() {
    css(this.$tip, { display: 'block' });
  },

  _bindUI: function() {
    var ctx = this, options = ctx.options;
    var $input = ctx.$input;

    function canShow() {
      return !ctx.isDisabled();
    }

    addEvent(ctx.$ul, 'click', function(e) {
      var target = e.srcElement || e.target,
        name = target.tagName.toLowerCase();
      if (name == 'li') {
        ctx._selectItem(target);
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

    var Code_Up = 38, Code_Down = 40;
    var keydownTimespace = 0;

    // 绑定input的键盘事件
    addEvent($input, 'keydown', function(e) {
      if (!canShow()) { return; }

      keydownTimespace = new Date;

      var hadChagned = false;
      var shouldStopDefault = false;

      var keyCode = e.keyCode;
      
      if (ctx.options.changeAsSelect && (keyCode === Code_Up || keyCode === Code_Down)) {
        ctx._lockLis = true;
      }

      switch(keyCode){
        case Code_Up:
          ctx.prev();
          hadChagned = true;
          break;
        case Code_Down:
          ctx.next();
          hadChagned = true;
          break;
        case 13:
          ctx._selectItem(ctx.$lis[ctx._getActiveIndex()]);
          ctx.hide();
          shouldStopDefault = true;
          break;
      }

      if (hadChagned) {
        options.callbackChange(ctx._index);
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
      
      var ignoreOnceLockLis = false;
      // keydown 改变value的时候，会强制触发一次 propertychange
      if (e.type === 'propertychange') {
        if (new Date - keydownTimespace <= 10) {
          ignoreOnceLockLis = true;
        }
      }

      if (!ignoreOnceLockLis) {
        ctx._lockLis = false;
      }

      if (!canShow()) { return; }
      var value = trim($input.value);
      
      if (value) {
        ctx._hidePlaceholder();
      } else {
        ctx._showPlaceholder();
      }

      ctx._buildLi(value);
      ctx._fixIndex();
      if (!ctx.isShow) {
        ctx.show();
      }
    }
  },

  _buildLi: function(value) {
    var ctx = this, options = ctx.options, freeInput = options.freeInput;
    if (ctx._lockLis) { return; }

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

  _fixIndex: function(indexSelected) {
    var ctx = this;
    // 索引修正为滚动索引
    indexSelected = indexSelected || ctx._getSelectIndex();
    if (ctx.options.selectFirst) {
      indexSelected = indexSelected < 0 ? 0 : indexSelected;
    }
    ctx._index = indexSelected;

    var $li = ctx.$lis[ctx._index];
    if ($li) {
      addClass($li, CLASS_ACTIVE);
      ctx._fixScroll();
    }
  },

  _fixScroll: function() {
    var ctx = this, $ul = ctx.$ul, $lis = ctx.$lis;
    var index = ctx._getActiveIndex();
    $ul.scrollTop = index >= 0 && $lis[0] ? $lis[0].clientHeight * index : 0;
  },

  _setIndex: function(index) {
    var ctx = this,
      $lis = ctx.$lis,
      length = $lis.length;

    var minIndex = ctx._minIndex;

    if (index <= minIndex) {
      index = minIndex;
    } else if (index >= length) {
      index = length - 1;
    }

    // 找出当前active的元素，删掉 active
    var indexCurrent = ctx._getActiveIndex();
    if (indexCurrent >= 0) {
      removeClass($lis[indexCurrent], CLASS_ACTIVE);
    }

    // 然后找出下一个需要添加 active 的元素
    var $li = $lis[index];
    if ($li) {
      addClass($li, CLASS_ACTIVE);
      ctx._fixScroll();
    }
    ctx._index = index;

    if (ctx.options.changeAsSelect) {
      ctx._selectItem(ctx.$lis[index]);
    }
  },

  _selectItem: function($li) {
    var ctx = this, text, value;
    if ($li) {
      text = $li.innerHTML,
      value = attr($li, 'data-value');
    } else {
      if (ctx.options.freeInput) {
        value = ctx.$input.value;
      } else if (ctx.options.emptyInput) {
        // 已经允许输入空字符串了
        value = '';
      } else {
        value = ctx.$value.value;
      }
    }
    ctx.setValue(value);
  },

  _getActiveIndex: function() {
    var ctx = this, index = -1;
    for (var i = 0; i < ctx.length; i++) {
      var $li = ctx.$lis[i];
      if (hasClass($li, CLASS_ACTIVE)) {
        return i;
      }
    }
    return index;
  },

  _getSelectIndex: function() {
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
    return this._setIndex(this._index + 1);
  },

  prev: function() {
    return this._setIndex(this._index - 1);
  },

  hide: function() {
    var ctx = this;
    ctx._lockLis = false;

    css(ctx.$ul, { display: 'none' });
    ctx._hidePlaceholder();

    if (ctx.options.resetOnHide) {
      if (ctx.options.emptyInput && ctx.$input.value === '') {
        ctx.setValue('');
      } else {
        ctx.setValue(ctx.$value.value);
      }
    }

    ctx._doCallback();
    ctx._listenBodyRemove && ctx._listenBodyRemove();
    ctx.isShow && ctx.options.callbackHide.call(ctx);
    ctx.isShow = false;
  },

  show: function(indexSelected) {
    var ctx = this;
    ctx._lockLis = false;

    ctx._buildLi(ctx.$input.value);
    css(ctx.$ul, { display: 'block' });

    // 绑定 body 元素的点击，隐藏掉$ul
    ctx._listenBody();
    !ctx.isShow && ctx.options.callbackShow.call(ctx);
    ctx.isShow = true;
  },

  getValue: function() {
    return this.$value.value;
  },

  setValue: function(value) {
    // @notice 如果删掉 setValue 时，自动修复 text 的动作，就可以更加灵活了
    var ctx = this;
    ctx.$value.value = value;
    if (value) {
      ctx._hidePlaceholder();
    }

    // @fix 防止初始化无法找到对应的 data-value 值
    ctx._buildLi('');

    if (ctx.length == 0 && !ctx.options.freeInput || ctx.options.freeInput && value === '') {
      var html = ctx.$tip.innerHTML;
      // 如果自由输入，而且 value === ''
      if (ctx.options.freeInput && value === '') {
        ctx.$value.value = html;
      }
      ctx._setText(html);
    } else {
      if (ctx.$lis) {
        var $curLi = ctx.$lis[ctx._getActiveIndex()];
        if ($curLi) {
          removeClass($curLi, CLASS_ACTIVE);
        }
      }

      var hasFindInLi = false;
      for (var i = 0, max = ctx.length; i < max; i++) {
        var $li = ctx.$lis[i], _value = attr($li, 'data-value');
        if (_value == value) {
          addClass($li, CLASS_ACTIVE);
          ctx._setText(trim($li.innerHTML));
          hasFindInLi = true;
          break;
        }
      }

      // value 值，不存在 data-value 属性中
      if (!hasFindInLi) {
        ctx._setText(value);
      }
    }

    if (ctx._oldValue != value) {
      ctx._doCallback();
    }
  },

  _setText: function(text) {
    var ctx = this, $input = ctx.$input, placeholder = ctx.options.placeholder;
    if (text === placeholder) {
      // text = '';
    } else if (ctx.options.emptyInput) {
      // placeholder 保持原型
    } else if (text) {
      placeholder = text;
    }

    $input.value = text;
    ctx.setPlaceholder(placeholder);
    text ? ctx._hidePlaceholder() : ctx._showPlaceholder();
  },

  setDisabled: function(disabled) {
    this.$input.disabled = disabled;
  },

  isDisabled: function() {
    var $input = this.$input;
    return $input.disabled || $input.readOnly;
  },

  _listenBody: function() {
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
    ctx._listenBodyRemove = remove;
    ctx._listenBody = listen;
    listen();
  },

  _doCallback: function() {
    var ctx = this,
      value = ctx.getValue();
    if (ctx._oldValue !== value) {
      ctx._oldValue = value;
      var text = trim(ctx.$tip.innerHTML);
      if (ctx.options.emptyInput) {
        text = ctx.$input.value;
      }
      ctx.options.callbackSelect(value, text);
    }
  }
};



    return AutoComplete;
});