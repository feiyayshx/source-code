let oldArrayProtoMethods = Array.prototype

/* 创建一个新对象，新对象的原型对象指向参数对象Array.prototype */
export let arrayMethods = Object.create(Array.prototype)

let methods = ['push', 'pop', 'shift', 'unshift', 'splice', 'reverse', 'sort']

// AOP 切片编程
methods.forEach((method) => {
  // 给新对象添加数组方法(这些方法都可以改变原始数组)
  arrayMethods[method] = function (...args) {
    let ob = this.__ob__

    let result = oldArrayProtoMethods[method].call(this, ...args)
    // 用户新增的数据也可能是对象格式，需要进行拦截观测
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
      default:
        break
    }

    if (inserted) ob.observeArray(inserted)

    return result
  }
})

// arrayMethods.push()
