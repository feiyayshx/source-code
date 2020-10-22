const http = require('http')
const Router = require('./router')
// 单独封装应用系统及路由系统
function Application() {
  // 创建应用时，同时也创建一个路由系统
  this._router = new Router()
  // this.routes = [
  //   {
  //     path: '*',
  //     method: 'all',
  //     handler: (req, res) => {
  //       res.end(`Cannot ${req.method} ${req.url}`)
  //     }
  //   }
  // ]
}
Application.prototype.get = function (path, callback) {
  this._router.get(path, callback)
  // this.routes.push({
  //   path,
  //   method: 'get',
  //   handler: callback
  // })
}
Application.prototype.listen = function (...args) {
  let server = http.createServer((req, res) => {
    // 路由系统处理不了的情况，让应用系统处理
    function done() {
      res.end(`Cannot ${req.method} ${req.url}`)
    }
    // 交给路由来匹配规则
    this._router.handle(req, res, done)

    // let { pathname } = url.parse(req.url)
    // let reqMethod = req.method.toLowerCase()
    // for (let i = 0; i < this.routes.length; i++) {
    //   let { path, method, handler } = this.routes[i]
    //   if (pathname === path && reqMethod === method) {
    //     return handler(req, res)
    //   }
    // }
    // 匹配不到路由，则默认执行第一个
    // this.routes[0].handler(req, res)
  })

  server.listen(...args)
}
module.exports = Application