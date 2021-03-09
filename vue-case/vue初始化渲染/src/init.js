import { initState } from './state.js'
import { compileToFunctions } from './compiler/index.js'
import { mountComponent } from './lifecycle.js'
// 初始化-》初始化状态-》初始化数据

export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this
    // 实例上有个属性$options，表示用户传入的所有属性
    vm.$options = options
    // 初始化状态
    initState(vm)

    // 将数据更新到dom
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }

  Vue.prototype.$mount = function (el) {
    el = document.querySelector(el)

    const vm = this
    vm.$options.el = el

    /**
     * 1. 如果$options 传入的有render,不做任何处理，直接使用render，否则执行2；
     * 2. 如果没有render，判断是否有template，有则将template转换render,否则执行3；
     * 3. 没有render和template，就找外部模版，获取一个template模版，最终转换成render函数；
     * 
    */

    if (!vm.$options.render) {
      let template = vm.$options.template
      // 没有template
      if (!template && el) {
        template = el.outerHTML // 如果浏览器不兼容，考虑创建一个div标签插入到页面
      }
      // 将template 转换成render()函数
      const render = compileToFunctions(template)

      // 将生成的render函数绑定到$options上
      vm.$options.render = render

    }

    mountComponent(vm, el)

  }
}


