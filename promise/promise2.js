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
}

module.exports = Promise
