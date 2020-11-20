import { arrayMethods } from './array.js'

class Observer {
  // 对value重新定义
  constructor(value) {
    // 给响应式数据增加__ob__
    value.__ob__ = this

    Object.defineProperty(value,'__ob__',{
        value: this,
        enumerable: false, // 不可枚举
        configurable:false,// 不能删除此属性
    })
    // value可能是对象，也可能是数组，分情况处理
    if (Array.isArray(value)) {
      // 观测数组：重写可以改变数组的方法，不使用defineProperty
      Object.setPrototypeOf(value, arrayMethods)
      // 如果数据中的每项元素也是一个对象，则观测它
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }
  // 将数组中的对象变成响应式的
  observeArray(value) {
    for (let i = 0; i < value.length; i++) {
      observe(value[i])
    }
  }
  walk(data) {
    // 将对象中的每个属性,重新定义成响应式的
    Object.keys(data).forEach((key) => {
      defineReactive(data, key, data[key])
    })
  }
}

// 定义一个方法，调用defineProperty 来观测数据，可以复用该方法
export function defineReactive(data, key, value) {
  // 如果value也是对象，递归观测对象
  observe(value)
  Object.defineProperty(data, key, {
    get() {
      return value
    },
    set(newValue) {
      if (newValue === value) return
      // 如果设置的值是个对象，将对象变成响应式
      observe(newValue)
      value = newValue
    },
  })
}

// 创建observe构造函数，实现数据观测
export function observe(data) {
  // 只对对象进行观测，不是对象无法观测
  if (typeof data !== 'object' || data === null) {
    return
  }
  // 如果数据被观测过，直接返回
  if(data.__ob__) return
  
  // 通过类实现对数据的观测，因为类方便扩展
  return new Observer(data)
}
