const url = require('url')
const Route = require('./route')
const Layer = require('./layer')

function Router() {
  this.stack = []
}

// 每次创建一个route, 同时会生成一个对应的layer; 并将route 挂载到layer上
Router.prototype.route = function (path) {
  let route = new Route()
  // 将路径path,路由route的真正回调dispatch传给layer
  let layer = new Layer(path, route.dispatch.bind(route))
  // layer加上route属性
  layer.route = route
  // 将layer入栈，等待执行
  this.stack.push(layer)
  return route
}
Router.prototype.get = function (path, handlers) {
  let route = this.route(path)
  // 将用户传入的真实回调存储到route中
  console.log(handlers, 'handlers')
  route.get(handlers)
}
Router.prototype.handle = function (req, res, out) {
  let { pathname } = url.parse(req.url)
  let reqMethod = req.method.toLowerCase()

  // 先遍历外层
  let idx = 0;
  const next = () => {
    if (this.stack.length === idx) out()
    let layer = this.stack[idx++]
    if (layer.match(pathname)) {
      layer.handle_request(req, res, out)
    }
  }
  next()

  // for (let i = 0; i < this.stack.length; i++) {
  //   let { path, method, handler } = this.stack[i]
  //   if (pathname === path && reqMethod === method) {
  //     return handler(req, res)
  //   }
  // }
  // // 匹配不到路由，则默认执行第一个
  // done()
}
module.exports = Router