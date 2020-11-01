import { initState } from './state.js'

export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this
    // 实例上有个属性$options，表示用户传入的所有属性
    vm.$options = options
    // 初始化状态
    initState(vm)
  }
}


// 初始化-》初始化状态-》初始化数据