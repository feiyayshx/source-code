let oldArrayProtoMethods = Array.prototype

export let arrayMethods = Object.create(Array.prototype)

let methods = ['push', 'pop', 'shift', 'unshift', 'splice', 'reverse', 'sort']

// AOP 切片编程
methods.forEach((method) => {
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
