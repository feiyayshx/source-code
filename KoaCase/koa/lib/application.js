const http = require('http')
const Stream = require('stream')
const Emitter = require('events')
const context = require('./context.js')
const request = require('./request.js')
const response = require('./response.js')

class Application extends Emitter {
  constructor() {
    super();
    // 创建koa应用的context对象，并继承于context
    this.context = Object.create(context)
    // 创建koa应用的request对象，并继承于request
    this.request = Object.create(request)
    // 创建koa应用的response对象，并继承于response
    this.response = Object.create(response)

    this.middlewares = []
  }
  // 合并并执行中间件
  compose(ctx) {
    let index = -1
    const dispatch = (i) => {
      // 一个方法都没有
      if (i <= index) return Promise.reject('next() called multiples times')
      // 方法执行完毕
      if (i === this.middlewares.length) return Promise.resolve();

      // 执行中间件方法
      index = i
      let middleware = this.middlewares[i]
      // middleware必须是一个Promise，如果不是需要包装成promise
      try {
        return Promise.resolve(middleware(ctx, () => dispatch(i + 1)))
      } catch (error) {
        Promise.reject(error)
      }

    }

    return dispatch(0)
  }
  use(fn) {
    this.middlewares.push(fn)
    // this.fn = fn
  }
  // 给koa应用的每个请求创建一个上下文
  createContext(req, res) {
    // 创建http请求的context对象，并继承于this.context
    let ctx = Object.create(this.context)
    // 创建http请求的request对象，并继承于this.request
    let request = Object.create(this.request)
    // 创建http请求的response对象，并继承于this.response
    let response = Object.create(this.response)

    // request,response 是koa自己封装的对象
    ctx.request = request
    ctx.response = response

    // req,res 是http原生对象
    ctx.request.req = ctx.req = req
    ctx.response.res = ctx.res = res

    return ctx
  }
  // http 回调处理
  handleRequest(req, res) {
    let ctx = this.createContext(req, res)
    this.compose(ctx).then(() => {
      // 执行完毕，最后将body的结果返回
      let body = ctx.body

      // 判断body的类型
      if (typeof body === 'string' || Buffer.isBuffer(body)) {
        res.end(body)
      } else if (body instanceof Stream) {
        body.pipe(res)
      } else if (typeof body === 'object') {
        res.end(JSON.stringify(body))
      } else {
        res.end('Not Found')
      }
    }).catch(error => {
      this.emit('error', error)
    })

    // 监听error事件
    this.on('error', () => {
      res.statusCode = 500;
      res.end('Internal Error')
    })
  }
  // 监听请求
  listen(...args) {
    const server = http.createServer(this.handleRequest.bind(this))
    server.listen(...args)
  }
}

module.exports = Application