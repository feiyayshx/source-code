import Watcher from './observer/watcher'
import { patch } from './vdom/patch'
export function lifecycleMixin(Vue) {
  Vue.prototype._update = function (vnode) {
    const vm = this
    // 首次渲染，需要用虚拟节点来更新真实的dom元素
    vm.$el = patch(vm.$options.$el, vnode)
  }
}

export function mountComponent(vm, el) {

  // 更新组件
  let updateComponent = () => {
    // 传入虚拟节点
    vm._update(vm._render())
  }

  // vue 通过渲染Watcher 进行渲染,每个组件都有一个渲染Watcher
  new Watcher(vm, updateComponent, () => { }, true)
}