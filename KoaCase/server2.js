const Koa = require('./koa')

const app = new Koa()
/**
 * 1. koa中所有use中传入的方法，都会包装成promise；
 * 2. 会把所有的promise变成一个promise链，内部的next前面加上await，或者return；
 * 3. 所有的异步逻辑都必须包装成promise;
*/
// 如果加了await next(),上一个中间件会等待下一个中间件执行完，在继续执行;符合洋葱模型标准
// 如果没有加await,上一个中间价不必等待下一个中间件中的异步逻辑
app.use(async function (ctx, next) {
  console.log(1)
  await next()
  console.log(2)
  ctx.body = '2'
})

app.use(async function (ctx, next) {
  console.log(3)
  await next()
  console.log(4)
  ctx.body = '4'

})
app.use(async function (ctx, next) {
  console.log(5)
  await next()
  console.log(6)
  ctx.body = '6'

})

app.listen(3001)