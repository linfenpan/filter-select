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
