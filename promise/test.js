
const Promise = require('./promise2.js')

// 走向失败有两种情况：1）调用reject； 2)在代码中抛出异常；
// 一旦成功和失败就不能更改状态
// executor是立即执行的
// let p1 = new Promise((resolve,reject) => {
//   console.log('executor')
//   setTimeout(() => {
//     reject('reject')
//   },2000)
// })

// p1.then(res => {
//   console.log(res,'res1')
// },error => {
//   console.log(error,'error')
// })

// p1.then(res => {
//   console.log(res,'res2')
// },error => {
//   console.log(error,'error')
// })

// const fs = require('fs');
// const path = require('path');

// function readFile(...args) {
//     return new Promise((resolve, reject) => {
//         fs.readFile(...args, function (err, data) {
//             if (err) return reject(err);
//             resolve(data);
//         })
//     })
// }

// readFile(path.resolve(__dirname, './name.txt'), 'utf-8').then(data => {
//   console.log(data,'d')
//   return readFile(path.resolve(__dirname, data), 'utf8')
// }).then(data => {
//   console.log('success', data)
// }, err => {
//   console.log('err', err)
// })

/*=================== then链式调用 ===========================*/
let p1 = new Promise((resolve,reject) => {
  setTimeout(() => {
    resolve('ok')  // 走向then的成功回调
    // reject('失败了') // 走向then的失败回调
  },1000)
})

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
  console.log(err,'err')
})