
# 规范
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

### then返回值
then必须返回一个promise对象。

```
const promise2 = promise1.then(onFulfilled,onRejected)
```

- onFulfilled或onRejected返回值是x，则执行下面的Promise的解决过程[[Resolve]](promise2, x)。

- 如果onFulfilled或onRejected抛出异常e，promise2必须拒绝执行，并返回拒绝原因。

- 如果onFulfilled不是函数且promise1成功执行，promise2必须成功执行并返回相同的值。

- 如果onRejected不是函数且promise1拒绝执行，promise2必须拒绝执行并返回相同的拒绝原因。

总结注意：不论promise1是成功执行(resolve)还是拒绝执行(reject)，promise2都会成功执行resole()，只有promise1抛出异常时，promise2才会拒绝执行(reject)。

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
