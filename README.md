# FilterSelect.js

不依赖任何脚本库，兼容 ie7+/chrome/firefox 等浏览器。
现版本，仅支持与select元素配合

# 使用
``` javascript
var filter = new FilterSelect(document.getElementsByTagName('select')[0], {
  callback: function(key, text) {
    // at: 每次选中，在下拉组件隐藏时，触发
    console.log(key + ':' + text);
  },
  resetCallback: function(key, text) {
    // at: 初始化和调用reset方法，异步回调
    console.log('初始化完毕，默认选中:' + key + '/' + text);
  },
  // 是否允许自由输入，默认 false。NOTICE 不怎么只能，考虑去掉这个参数
  freeInput: false,
  // focus时，是否清空内容，默认 true
  clearAtFocus: true
});

// 获取当前组件的值
// select 中的 option，如果含有 value 属性，filter.getVale 返回 option.value 对应的值，否则，返回 option.text
filter.getValue();
```
