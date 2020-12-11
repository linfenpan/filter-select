# filter-select.js

不依赖任何脚本库，兼容 ie7+/chrome/firefox 等浏览器。
基于同项目下的 auto-complete.js[不支持异步更新数据] 编写。

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

# 参数说明
核心的`auto-complete.js`与对外的`filter-select.js`两个的参数，几乎是一致的:

## data: Function(text, done)
`auto-complete.js` 特有参数，`filter-select.js`读取了select元素的option，进行自动生成

```javascript
{
  data: function(text, done) {
    // text -> 当前输入框的值
    // 这个 text 文案下，下拉框需要显示的内容，用 [ {id, value } ] 的形式组织，并扔到 done 里面
    done([
      { id: 1, value: '文案内容' },
      ...
    ]);
  }
}
```

## callbackSelect:Function(id, value)
选中下拉内容后的回调

## callbackChange:Function()
当下拉框内容，索引发生变化时触发回调

## callbackShow:Function()
当下拉框出现时，触发回调

## callbackHide:Function()
当下拉框隐藏时，触发回调

## clearAtFocus:Boolean = true
输入框获得焦点时，清空当前输入框的文案内容。清空内容后，实际组件的 value 值并不会发生更变。

## resetOnHide:Boolean = true
在关闭下拉框时，如果输入不规范时（内容不在默认列表时），是否重置输入的内容

## placeholder:String = '请选择'
输入框的 placeholder

## defaultValue:Any = ''
组件的默认value值

## defaultText:Any = ''
组件的默认文案内容

## emptyInput:Boolean = false
是否允许输入空字符串

## changeAsSelect:Boolean = false
当索引发生变化时（键盘上下操作时），是否立即选中元素

## selectFirst:Boolean = true
下拉框出现时，是否默认选中第一个元素

## freeInput:Boolean = true
是否允许自由输入任何内容。如果是限制用户的输入内容，请设置为 false。
如果设置为true，那么`defaultText`的设置会覆盖掉`defaultValue`。

## minIndex:Int = -1
可以选择的最小索引值，一般 `-1` 即可，特殊情况可填 `0`，其他的值，不保证没BUG~


# 修改历史
- 1.0.5: 增加允许输入空字符串的控制参数，`emptyInput: false`, `lockWhenKeyboardSelect: false`，auto-complte组件的样式有微弱的调整，脚本整体包裹了 umd 规范，调整了样式名称，删除了旧版本的filterSelect.js

# demo
[一个古老版本的体验demo>>](https://linfenpan.github.io/demo/filterSelect/index.html)

最新的实现，请参考 `index.html` 和 `auto-complete.html` 两个文件