;(function(ctx, name, defination) {
  ctx[name] = defination(ctx);
})(window, 'FilterSelect', function(win) {
  var NOT_DEFINED = void 0;

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

  function Select($select, options) {
    var ctx = this;
    ctx.$select = $select;

    options = ctx.options = merge({
      callback: function(id, val) {
        // console.log('选中', id, val);
      },
      resetCallback: function(id) {
        // 初始化完毕
      },
      clearAtFocus: true,
      freeInput: false,
      placeholder: '请选择'
    }, options || {});

    var $root = ctx.$root = document.createElement('div');
    $root.innerHTML = [
      '<div class="m-placeholder" style="display:none;"></div>',
      '<input type="text" class="m-input" autocomplete="false" disableautocomplete value="" />',
      '<input type="hidden" class="m-input-hidden" autocomplete="false" disableautocomplete value="" />',
      '<span class="m-input-ico"></span>',
      '<ul class="m-list" style="display:none;"></ul>'
    ].join('');
    addClass($root, 'm-input-select');
    attr($root, 'autocomplete', 'off');
    $select.parentNode.insertBefore($root, $select);

    ctx.$input = getElementsByTagName($root, 'input', 0);
    ctx.$value = getElementsByTagName($root, 'input', 1);
    ctx.$ico = getElementsByTagName($root, 'span', 0);
    ctx.$tip = getElementsByTagName($root, 'div', 0);
    ctx.$ul = getElementsByTagName($root, 'ul', 0);

    ctx.init();
  }

  Select.prototype = {
    init: function() {
      var ctx = this;
      ctx.setPlaceholder(ctx.options.placeholder);
      ctx.reset();
      ctx._bindUI();
    },

    reset: function() {
      var ctx = this;
      ctx.index = 0;
      ctx.isShow = false;

      var lis = [], valueSelected, textSelected;
      forEach(getElementsByTagName(ctx.$select, 'option'), function($option) {
        var text = trim($option.innerHTML), value = $option.value;
        // fix: ie7下，option.value如果没有设置，全部都是空; 其它浏览器下，则是 option.text 的值
        value = !value && ($option.outerHTML && !/\svalue=/i.test($option.outerHTML)) ? text : value;
        lis.push(
          '<li class="m-list-item" data-value="'+ value +'">'+ text +'</li>'
        );
        if ($option.selected) {
          valueSelected = value;
          textSelected = text;
        }
      });
      ctx.$ul.innerHTML = lis.join('');
      css(ctx.$ul, { display: 'none' });
      css(ctx.$select, { display: 'none' });

      ctx.$lis = getElementsByTagName(ctx.$ul, 'li');
      ctx.length = ctx.$lis.length;

      ctx.$input.value = textSelected;
      ctx.$tip.value = textSelected;
      var value = ctx.options.freeInput ? textSelected : valueSelected;
      ctx._setValue(value);
      ctx._oldValue = value;
      if (textSelected) {
        ctx.setPlaceholder(textSelected);
      } else {
        ctx._showPlaceholder();
      }

      // fix: 浏览器的 autocomplete bug
      setTimeout(function() {
        if (ctx.$select.value != ctx.$value.value) {
          ctx.reset();
        } else {
          ctx.options.resetCallback(value, textSelected);
        }
      });
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
        return !$input.disabled && !$input.readOnly;
      }

      addEvent(ctx.$ul, 'click', function(e) {
        var target = e.srcElement || e.target,
          name = target.tagName.toLowerCase();
        if (name == 'li') {
          ctx._setIndex(indexOf(ctx.$lis, target), true);
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
        if (
          options.clearAtFocus
          ||
          (options.freeInput && this.value == options.placeholder)
        ) {
          $input.value = '';
          ctx._showPlaceholder();
        }
        changeInput.call(this, e);
      });

      // 绑定input的键盘事件
      addEvent($input, 'keydown', function(e) {
        if (!canShow()) { return; }
        switch(e.keyCode){
          case 38:
            ctx.prev();
            break;
          case 40:
            ctx.next();
            break;
          case 13:
            ctx._setIndex(ctx._getActiveIndex(), true);
            ctx.hide();
            break;
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
          ctx._hidePlaceholder();
        } else {
          ctx._showPlaceholder();
        }
        ctx.filterByValue(value);
        ctx.show();
      }
    },

    // 过滤列表
    filterByValue: function(value) {
      var ctx = this,
        $list = ctx.$lis;
      value = trim(value || '').toLowerCase();

      // 过滤内容，并移除所有选中状态
      forEach($list, function($li) {
        var text = trim($li.innerHTML).toLowerCase();
        removeClass($li, CLASS_ACTIVE);
        css($li, { display: text.indexOf(value) >= 0 ? 'block' : 'none' });
      });

      // 如果有选中，则移动到选中的元素
      // 否则，选中可见元素的第一个
      var index = ctx._getSelectIndex();
      if (index >= 0) {
        addClass($list[index], CLASS_ACTIVE);
      } else {
        var indexVisible = ctx._getFirstVisibleIndex();
        if (indexVisible >= 0) {
          addClass($list[indexVisible], CLASS_ACTIVE);
        }
      }
    },

    _fixScroll: function() {
      var ctx = this, $ul = ctx.$ul, $lis = ctx.$lis;
      $ul.scrollTop = $lis[0].clientHeight * ctx._getScrollIndex();
    },

    _setIndex: function(index, needUpdate) {
      var ctx = this,
        $lis = ctx.$lis,
        length = ctx._getVisibleItemCount();

      if (index < 0) {
        index = 0;
      } else if (index >= length) {
        index = length - 1;
      }

      // 找出当前active的元素，删掉 active
      var indexCurrent = ctx._getActiveIndex();
      if (indexCurrent >= 0) {
        removeClass($lis[indexCurrent], CLASS_ACTIVE);
      }

      // 然后找出下一个需要添加 active 的元素
      var $li, indexScroll = 0;
      for (var i = 0; i < ctx.length; i++) {
        var _$li = $lis[i];
        if (css(_$li, 'display') != 'none') {
          if (indexScroll == index) {
            addClass(_$li, CLASS_ACTIVE);
            $li = _$li;
            break;
          }
          indexScroll++;
        }
      }

      if (!$li) {
        return;
      }

      ctx._fixScroll();
      ctx.index = index;

      if (needUpdate) {
        var text = $li.innerHTML,
          value = attr($li, 'data-value'),
          options = ctx.options;

        ctx.$input.value = text;
        ctx._setValue(options.freeInput ? text : value);
        ctx.$tip.innerHTML = text;
        ctx._hidePlaceholder();
      }
    },

    _getVisibleItemCount: function() {
      var length = 0;
      forEach(this.$lis, function($li) {
        var display = css($li, 'display');
        display != 'none' && length++;
      });
      return length;
    },

    _getActiveIndex: function() {
      var ctx = this, index = -1;
      for (var i = 0; i < ctx.length; i++) {
        var $li = ctx.$lis[i];
        if (hasClass($li, CLASS_ACTIVE) && css($li, 'display') != 'none') {
          return i;
        }
      }
      return index;
    },

    _getSelectIndex: function() {
      var ctx = this, index = -1, value = ctx.getValue();
      for (var i = 0; i < ctx.length; i++) {
        var $li = ctx.$lis[i];
        if (value == attr($li, 'data-value') && css($li, 'display') != 'none') {
          return i;
        }
      }
      return index;
    },

    _getScrollIndex: function() {
      var ctx = this, indexScroll = 0;
      for (var i = 0; i < ctx.length; i++) {
        var $li = ctx.$lis[i];
        if (css($li, 'display') != 'none') {
          if (hasClass($li, CLASS_ACTIVE)) {
            return indexScroll;
          }
          indexScroll++;
        }
      }
      return indexScroll;
    },

    _getFirstVisibleIndex: function() {
      var ctx = this, index = 0;
      for (var i = 0; i < ctx.length; i++) {
        var $li = ctx.$lis[i];
        if (css($li, 'display') != 'none') {
          return i;
        }
      }
      return -1;
    },

    next: function() {
      return this._setIndex(this.index + 1);
    },

    prev: function() {
      return this._setIndex(this.index - 1);
    },

    hide: function() {
      var ctx = this,
        text = trim(ctx.$input.value);;
      // 如果是自由输入模式，就保留输入值，否则就还原为上一次的值
      if (ctx.options.freeInput && text) {
        ctx._setValue(text);
        ctx.setPlaceholder(text);
      } else {
        ctx.$input.value = ctx.$tip.innerHTML;
        ctx._hidePlaceholder();
      }

      css(ctx.$ul, { display: 'none' });
      ctx.isShow = false;
      ctx._doCallback();
    },

    show: function() {
      var ctx = this;
      css(ctx.$ul, { display: 'block' });
      ctx.isShow = true;

      // 索引修正为滚动索引
      ctx.index = ctx._getScrollIndex();
      ctx._fixScroll();
      // 绑定 body 元素的点击，隐藏掉$ul
      ctx._listenBody();
    },

    getValue: function() {
      var ctx = this, options = ctx.options;
      return trim(options.freeInput ? ctx.$input.value : ctx.$value.value);
    },

    setValue: function(value) {
      var ctx = this;
      ctx._setValue(value);
      for (var i = 0, max = ctx.length; i < max; i++) {
        var $li = ctx.$lis[i], text = attr($li, 'data-value');
        if (text == value) {
          ctx.$input.value = text;
          ctx.setPlaceholder(text);
          return;
        }
      }
      // 如果到这个逻辑，说明了 value 值，不存在 data-value 属性中
      ctx.$input.value = value;
      ctx.setPlaceholder(value);
    },

    _setValue: function(value) {
      var ctx = this;
      ctx.$value.value = value;
      ctx.$select.value = value;
      attr(ctx.$select, 'data-value', value);
    },

    setDisabled: function(disabled) {
      this.$input.disabled = disabled;
    },

    _listenBody: function() {
      var ctx = this;
      var $body = document.getElementsByTagName('body')[0];
      function hide(e) {
        if (!ctx.$ul) {
          removeEvent($body, 'click', hide);
          return;
        }
        var target = e.srcElement || e.target;
        if (target != ctx.$input && target != ctx.$ico) {
          ctx.hide();
          removeEvent($body, 'click', hide);
        }
      }
      function listen() {
        removeEvent($body, 'click', hide);
        addEvent($body, 'click', hide);
      }
      ctx._listenBody = listen;
      listen();
    },

    _oldValue: null,
    _doCallback: function() {
      var ctx = this,
        value = ctx.getValue();
      if (ctx._oldValue !== value) {
        ctx._oldValue = value;
        ctx.options.callback(value, trim(ctx.$input.value));
      }
    }
  };

  return Select;
});
