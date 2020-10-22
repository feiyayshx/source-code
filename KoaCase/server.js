const Koa = require('./koa')

const app = new Koa()

/** 
 * 1. koa基于http模块创建服务
 * 2. ctx 是koa自己创建的上下文对象
 * 3. 基于原生req,res封装ctx自己的request,response 对象
 * 4. 原生req对象：ctx.req.url, ctx.request.res.url 
 * 5. ctx封装的request对象：ctx.request.path, ctx.path
 **/

app.use(function (ctx) {

  /* 原生req */
  console.log(ctx.req.url,'req')
  console.log(ctx.request.req.url,'request.req')

  /* koa封装的req */
  console.log(ctx.path, 'path')
  console.log(ctx.request.path, 'request.path')

  ctx.body = 'hello koa'

})

app.listen(3000)