
// 定义三种状态
const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'

// 解析promise2与x的关系，x决定promise2是走向成功还是失败
function resolvePromise(promise2, x, resolve, reject) {
  // x与promise2相等
  if(promise2 === x) {
    return reject(new TypeError('Chaining cycle detected for promise'))
  }
  // x为对象或函数(有可能是promise的情况)
  if((typeof x === 'object' && x !== null) || typeof x === 'function') {

    // 第三方的promise,可能走了成功，又走了失败，需要做处理，不能在成功或者失败后再去改变状态
    let called = false
    try {
      let then = x.then
      // 如果x是一个promise
      if(typeof then === 'function') {
        then.call(x, y => {
          if(called) return
          called = true
          resolvePromise(promise2,y,resolve,reject)
        },r => {
          if(called) return
          called = true
          reject(r)
        })
      } else {
        // x是一个普通对象
        resolve(x)
      }
    } catch (e) {
      if(called) return
      called = true
      // 捕获代码异常
      reject(e)
    }
  } else {
    // 普通值直接resolve
    resolve(x)
  }
}

class Promise {
  constructor(executor) {
    // 当前状态
    this.status = PENDING
    // 结果值
    this.value = undefined
    // 失败原因
    this.reason = undefined
    // 成功的回调
    this.onResolvedCallbacks = []
    // 失败的回调
    this.onRejectedCallbacks = []

    // 调用resolve走向成功
    const resolve = (value) => {
      // 如果直接resolve了一个promise会解析他的值
      if (value instanceof Promise) {
        return value.then(resolve, reject)
      }
      // 只用状态是PENDING，才可以走向成功
      if(this.status === PENDING) {
        this.status = FULFILLED
        this.value = value
        // 依次调用then成功回调
        this.onResolvedCallbacks.forEach(fn => fn())
      }
    }
    // 调用reject走向失败 
    const reject = (reason) => {
      if(this.status === PENDING) {
        this.status = REJECTED
        this.reason = reason
        // 依次调用then失败回调
        this.onRejectedCallbacks.forEach(fn => fn())
      }
    }

    try {
      // promise执行立即调用
      executor && executor(resolve,reject)
    } catch (error) {
      reject(error)
    }

  }
  then(onFulfilled,onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v;
    onRejected = typeof onRejected === 'function' ? onRejected : r => {throw r}
    const promise2 = new Promise((resolve,reject) => {
      if (this.status === FULFILLED) {
        // 确保 onFulfilled 和 onRejected 方法异步执行，且应该在 then 方法被调用的那一轮事件循环之后的新执行栈中执行
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value)
            resolvePromise(promise2,x,resolve,reject)
          } catch (e) {
            reject(e)
          }
        })
      }
      if(this.status === REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason)
            resolvePromise(promise2,x,resolve,reject)
          } catch (e) {
            reject(e)
          }
        })
      }
  
      if(this.status === PENDING) {
        this.onResolvedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value)
              resolvePromise(promise2,x,resolve,reject)
            } catch(e) {
              reject(e)
            }
          })
        })
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason)
              resolvePromise(promise2,x,resolve,reject)
             } catch(e) {
               reject(e)
             }
          })
          
        })
      }
    })

    return promise2
  }
  catch(onRejected){
    return this.then(null,onRejected)
  }
}

module.exports = Promise

/**
 * finally: 不管promise执行结果如何，都会执行的操作
 * finally方法的回调函数不接受任何参数
 * finally方法里面的操作，与状态无关，不依赖Promise的执行结果
 */ 
Promise.prototype.finally = function(final) {
  return this.then((value) => {
    // 执行final(), 并将value或reason传递下去
    return Promise.resolve(final()).then(() => value)
  },(reason) => {
    return Promise.resolve(final()).then(() => { throw reason })
  })
}

// 延迟对象
Promise.deferred = function() {
  let dfd = {}
  // 延迟对象返回一个promise实例，resolve,reject
  dfd.promise = new Promise((resolve,reject) => {
    dfd.resolve = resolve
    dfd.reject = reject
  })
  return dfd
}

Promise.resolve = function(value) {
  return new Promise(resolve => {
    resolve(value)
  })
}

Promise.reject = function (reason) {
  return new Promise((resolve, reject) => {
      reject(reason)
  })
}

Promise.all = function(values) {
  return new Promise((resolve,reject) => {
    let result = []
    let times = 0
    const processMap = (i,data) => {
      result[i] = data
      times++
      if(times === values.length) {
        resolve(result)
      }
    }
    // for循环是并发的，异步串行需要使用递归实现
    for(let index=0;index<values.length;index++) {
      let item = values[index]
      Promise.resolve(item).then(data => {
        processMap(index,data)
      },reject)
    }
  })

}

Promise.race = function(values) {
  return new Promise((resolve,reject) => {
    values.forEach(item => {
      Promise.resolve(item).then(resolve,reject)
    })
  })
}

Promise.allSettled = function(values) {
  return new Promise(resolve => {
    let result = []
    let times = 0

    const processMap = (i,data) => {
      result[i] = data
      times++
      if(times === values.length) {
        resolve(result)
      }
    }

    for(let index=0; index<values.length;index++) {
      let item = values[index]
      Promise.resolve(item).then((v) =>{
        processMap(index,{status: 'fulfilled',value:v})
      },reason=>{
        processMap(index,{status: 'rejected',reason})
      })
    }
  })
}

Promise.any = function(values) {
  return new Promise((resolve,reject) => {
    let result = []
    let times = 0
    const processMap = (i,reason) => {
      result[i] = reason
      times++
      if(times === values.length) {
        reject(result)
      }
    }
    for(let index=0; index<values.length;index++) {
      let item = values[index]
      Promise.resolve(item).then(resolve, (reason) => {
        processMap(index,reason)
      })
    }
  })
}

// node中的promisify
function promisify(fn) {
  return function (...args) {
      return new Promise((resolve, reject) => {
          // 可以将node中的异步api转化成promise 
          fn(...args, function (err, data) {
              if (err) return reject(err);
              resolve(data);
          })
      })
  }
}

function promisifyAll(obj) {
  for (let key in obj) {
      if (typeof obj[key] == 'function') {
          obj[key] = promisify(obj[key])
      }
  }
}









