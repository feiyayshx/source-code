## Promise介绍
Promise是一个拥有then方法的对象或函数，其行为符合Promise A+ 规范。

## promise 状态
一个promise的状态必须是以下三种状态中的一种：pending,fulfilled,rejected
- pending(等待状态) 满足的条件
  - 处于等待状态，可以走向成功或走向失败状态
- fulfilled(成功状态) 满足的条件
  - 不可以走向任何状态
  - 必须有一个不可变的终值(value)
- rejected(拒绝状态) 满足的条件
  - 不可以走向任何状态
  - 必须有一个不可变的拒绝原因(reason)

```
// 定义三种状态
const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'

class Promise {
   constructor(executor) {
    // 当前状态
    this.status = PENDING
    // promise执行成功后的结果值
    this.value = undefined
    // promise拒绝后的失败原因
    this.reason = undefined

    // 调用resolve走向成功
    const resolve = (value) => {
      // 只有状态是PENDING，才可以走向成功
      if(this.status === PENDING) {
        this.status = FULFILLED
        this.value = value
      }
    }

    // 调用reject走向失败 
    const reject = (reason) => {
      // 只有状态是PENDING，才可以走向成功
      if(this.status === PENDING) {
        this.status = REJECTED
        this.reason = reason
      }
    }

    try {
      // promise执行立即调用
      executor && executor(resolve,reject)
    } catch (error) {
      reject(error)
    }

  }
}
```

代码分析：
- 定义status, value, reason。
- executor是Promise的输入参数，调用new Promise(executor)，executor立即执行。
- executor接受两个参数，第一个参数resolve回调，第二个参数是reject回调。
- 调用resolve() 使Promise执行成功，调用reject() 使Promise执行拒绝。

## then方法
一个promise必须提供then方法来访问当前或最终的值及拒绝原因。
then方法提供两个参数:
promise.then(onFulfilled,onRejected)
onFulfilled和onRejected是可选参数，如果不是函数，则必须忽略。

### onFulfilled和onRejected 必须被作为函数调用。
### onFulfilled 和 onRejected 只有在执行环境堆栈仅包含平台代码时才可被调用。
#### onFulfilled特性
- 必须在promise成功(fulfilled)后调用，promise的值(value)作为它的第一个参数
- promise成功之前不能被调用
- 调用次数不超过一次

#### onRejected特性
- 必须在promise拒绝(rejected)后调用, promise的拒绝原因(reason)作为它的第一个参数
- promise拒绝之前不能被调用
- 调用次数不超过一次

### then多次调用要求
then方法可以被同一个promise调用多次：
- 当promise成功执行时，所有的onFulfilled按照注册顺序依次执行回调
- 当promise被拒绝执行时，所有的onRejected按照注册顺序依次执行回调

```
class Promise {
  constructor(executor) {
    /* ... */

    // 成功的回调
    this.onResolvedCallbacks = []
    // 失败的回调
    this.onRejectedCallbacks = []

    // 调用resolve走向成功
    const resolve = (value) => {
      // 只有状态是PENDING，才可以走向成功
      if(this.status === PENDING) {
        this.status = FULFILLED
        this.value = value
        // 依次调用then成功回调
        this.onResolvedCallbacks.forEach(fn => fn())
      }
    }

    // 调用reject走向失败 
    const reject = (reason) => {
      // 只有状态是PENDING，才可以走向成功
      if(this.status === PENDING) {
        this.status = REJECTED
        this.reason = reason
        // 依次调用then失败回调
        this.onRejectedCallbacks.forEach(fn => fn())
      }
    }

    /* ... */
  },
  then(onFulfilled,onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v;
    onRejected = typeof onRejected === 'function' ? onRejected : r => {throw r}

    if (this.status === FULFILLED) {
      onFulfilled(this.value)
    }
    if(this.status === REJECTED) {
      onRejected(this.reason)
    }

    if(this.status === PENDING) {
      this.onResolvedCallbacks.push(() => {
        onFulfilled(this.value)
      })
      this.onRejectedCallbacks.push(() => {
        onRejected(this.reason)
      })
    }

  }
}
```

代码分析：
- 定义onResolvedCallbacks，存储onFulfilled 回调，promise执行成功时，按注册顺序依次执行回调。
- 定义onRejectedCallbacks，存储onRejected 回调，promise执行拒绝时，按注册顺序依次执行回调。
- 如果当前状态是pending, 注册成功回调及拒绝回调。
- 如果当前是成功状态，执行成功回调。
- 如果当前是拒绝状态，执行失败回调。

### then返回值
then必须返回一个promise对象。

```
const promise2 = promise1.then(onFulfilled,onRejected)
```

- onFulfilled或onRejected返回值是x，则执行下面的Promise的解决过程[[Resolve]](promise2, x)。

- 如果onFulfilled或onRejected抛出异常e，promise2必须拒绝执行，并返回拒绝原因。

- 如果onFulfilled不是函数且promise1成功执行，promise2必须成功执行并返回相同的值。

- 如果onRejected不是函数且promise1拒绝执行，promise2必须拒绝执行并返回相同的拒绝原因。


```
class Promise {
  /* ... */
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
```

- 使用try...catch, 来捕获错误, 不论promise1是执行成功还是拒绝，promise2都会执行成功，只有promise1抛出异常，promise2才会拒绝执行。

假设onFulfilled 和 onRejected 的返回值x是个普通值，直接resolve。到此，实现了一个简单版的promise。

完整代码promise.js如下：
```
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

```

接下来讨论x与promise2的关系，由x决定promise2是成功或拒绝。

## Promise的解决过程
Promise的解决过程是一个抽象的操作，需要输入一个promise和一个值，我们表示为[[Resolved]](promise,x),如果 x 有 then 方法且看上去像一个Promise ，解决程序即尝试使 promise 接受 x 的状态；否则其用x的值来执行 promise。
这种 thenable 的特性使得 Promise 的实现更具有通用性：只要其暴露出一个遵循 Promise/A+ 协议的 then 方法即可；这同时也使遵循 Promise/A+ 规范的实现可以与那些不太规范但可用的实现能良好共存。

运行 [[Resolve]](promise, x) 需遵循以下步骤：
### x与promise相等
如果promise与x指向同一个对象，以TypeError为拒绝原因拒绝执行promise。

### x为Promise
如果x为Promise,则让promise接受x的状态：
- 如果 x 处于等待态， promise 需保持为等待态直至 x 被执行或拒绝。
- 如果 x 处于成功态，用相同的值执行 promise。
- 如果 x 处于拒绝态，用相同的拒因拒绝 promise。

### x为对象或函数
- 把 x.then 赋值给 then。
- 如果取 x.then 的值时抛出错误 e ，则以 e 为据因拒绝 promise。
- 如果 then 是函数，将 x 作为函数的作用域 this 调用之。传递两个回调函数作为参数，第一个参数叫做 resolvePromise ，第二个参数叫做 rejectPromise:
  - 如果 resolvePromise 以值 y 为参数被调用，则运行 [[Resolve]](promise, y)。
  - 如果 rejectPromise 以据因 r 为参数被调用，则以据因 r 拒绝 promise。
  - 如果 resolvePromise 和 rejectPromise 均被调用，或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用。
  - 如果调用 then 方法抛出了异常 e：
    - 如果 resolvePromise 或 rejectPromise 已经被调用，则忽略之。
    - 否则以 e 为据因拒绝 promise。
  - 如果 then 不是函数，以 x 为参数执行 promise。
- 如果 x 不为对象或者函数，以 x 为参数执行 promise。

代码实现如下：

```
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
  constructor() {
    /*...*/
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

  }
  then(onFulfilled,onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v;
    onRejected = typeof onRejected === 'function' ? onRejected : r => {throw r}

    const promise2 = new Promise((resolve,reject) => {
      if (this.status === FULFILLED) {
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value)
            // 假设此处的x是普通值，如果是promise需要进一步解析
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
```

代码分析： 
- 使用setTimeout,确保 onFulfilled 和 onRejected 方法异步执行，且应该在 then 方法被调用的那一轮事件循环之后的新执行栈中执行。
- 执行resolvePromise 完成promise的解决过程。
- 如果value值是promise,则继续解析。

读到此处的小伙伴恭喜你：一个符合Promise A+规范的高阶版的Promise已经实现了！！！
[点击查看高阶版全部代码]()

## 测试案例
then链式调用测试：
```
let p1 = new Promise((resolve,reject) => {
  setTimeout(() => {
    resolve('ok')  // 走向then的成功回调
    // reject('失败了') // 走向then的失败回调
  },1000)
})

// then回调的返回值不是promise
p1.then((res) => {
  console.log(res,'success then1')
  return res
},(err) => {
  console.log(err,'err then1')
  return err
}).then(function(data) {
  // 不管上一个then是成功还是失败，其返回值如果不是promise,都会传递到下一个then的成功回调中
  console.log(data,'success')
}, err => {
  // 代码抛出异常走到此处
  console.log(err,'err')
})

// then回调的返回值是promise的情况
p1.then((res) => {
  console.log(res,'success then1')
  return new Promise((resolve,reject) => {
    setTimeout(() => { reject(res) },1000)
  })
},(err) => {
  console.log(err,'err then1')
  return new Promise((resolve,reject) => {
    setTimeout(() => { resolve(err) },1000)
  })
}).then(function(data) {
  // 上一个then回调返回一个成功的promise
  console.log(data,'success')
}, err => {
  // 上一个then回调返回一个失败的promise或者代码抛出异常
  console.log(err,'err')
})

```

then传递的成功和失败的回调函数，它们的返回值决定下一个then的走向，针对其返回值做不同的处理：
- 如果第一个then的返回值(假定为x)不是promise，那么无论是成功回调还是失败回调，x都会直接传递到下一次then的成功的回调中。
- 如果第一个then的返回值是promise,则根据promise的结果来确定下一个then的结果。
  - promise是成功，下一个then走向成功回调。
  - promise是失败，下一个then走向失败回调。
- 下一个then走向失败的情况：
  - 代码抛出错误
  - 上一个then中有返回了一个失败的promise 
- 如果返回的是一个pending的proimise 则会中断promoise的链。
