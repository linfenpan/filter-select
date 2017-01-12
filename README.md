# filter-select.js

不依赖任何脚本库，兼容 ie7+/chrome/firefox 等浏览器。
基于同项目下的 auto-complete.js 编写。

filter-select.js，主要是把 select 元素，更替为可输入进行筛选的组件。
用法:
``` javascript
var s = new FilterSelect(document.getElementsByTagName('select')[0], {
  callbackSelect: function(key, text) {
    console.log('选中:' + key + '/' + text);
  }
});
// 通过 s.getValue() 获取到最新的值
// 通过 s.setValue() 设置组件的值
```

注意:
如果 select 的 option，附带了value属性，那么 s.getValue() 等于 option.value。
否则 s.getValue() 等于 option.text。

建议 select 的 option，都带上 value 属性，或都不带上。
给 select 元素，设置 autocomplete="off" 属性，防止浏览器自动补全，带来不必要的问题。
