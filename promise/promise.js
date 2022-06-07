// 定义三种状态
const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'

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
        try {
          let x = onFulfilled(this.value)
          // 假设此处的x是普通值，如果是promise需要进一步解析
          resolve(x)
        } catch (e) {
          reject(e)
        }
      }
      if(this.status === REJECTED) {
        try {
          let x = onRejected(this.reason)
          resolve(x)
        } catch (e) {
          reject(e)
        }
      }
  
      if(this.status === PENDING) {
        this.onResolvedCallbacks.push(() => {
          try {
            let x = onFulfilled(this.value)
            resolve(x)
          } catch(e) {
            reject(e)
          }
        })
        this.onRejectedCallbacks.push(() => {
          try {
           let x = onRejected(this.reason)
           resolve(x)
          } catch(e) {
            reject(e)
          }
        })
      }
      
    })

    return promise2
  }
}

module.exports = Promise
