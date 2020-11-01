import { observe } from './observer/index.js'

export function initState(vm) {
  // 获取用户传入的options数据，数据类型可能是data,props,methods,computed,watch等
  const opts = vm.$options
  // 此处加入是data数据
  if (opts.data) {
    initData(vm)
  }
}
function proxy(vm, source, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[source][key]
    },
    set(newValue) {
      vm[source][key] = newValue
    },
  })
}
function initData(vm) {
  // 劫持数据
  let data = vm.$options.data
  // 对data进行判断，如果是函数，获取返回值，否则直接获取数据
  /* 设置vm._data 实现通过vm获取data */
  data = vm._data = typeof data === 'function' ? data.call(vm) : data

  // 将_data中的数据全部代理到vm上
  for (let key in data) {
    // 例如：取vm.name 实际上就是取vm._data.name
    proxy(vm, '_data', key)
  }
  // 观测数据data,调用Object.defineProperty()
  observe(data)
}
