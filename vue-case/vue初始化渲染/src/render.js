import {createElement,createTextVnode} from './vdom/index.js'

export function renderMixin(Vue) {
  // 创建元素的虚拟节点
  Vue.prototype._c = function(...args) {
    return createElement(this,...args)
  }

  // 创建文本的虚拟节点
  Vue.prototype._v = function(text) {
    return createTextVnode(text)
  }

  // 转化为字符串
  Vue.prototype._s = function(val) {
    return val == null ? '' : (typeof val == 'object') ? JSON.stringify(val) : val
  }

  Vue.prototype._render = function() {
    const vm = this
    // 获取编译后的render函数
    let render = vm.$options.render

    // 调用render函数，生成虚拟节点,调用时会将变量赋值
    let vnode = render.call(vm)

    return vnode

  }
}