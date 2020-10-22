const http = require('http')
const url = require('url')
const Router = require('./router')
// 单独封装应用系统及路由系统
function Application() {
  // 创建应用时，同时也创建一个路由系统
  this._router = new Router()
}
Application.prototype.get = function (path, callback) {
  this._router.get(path, callback)
}
Application.prototype.listen = function (...args) {
  let server = http.createServer(function (req, res) {
    // 路由系统处理不了的情况，让应用系统处理
    function done() {
      res.end(`Cannot ${req.method} ${req.url}`)
    }
    // 交给路由来匹配规则
    this._router.handle(req, res, done)
  })

  server.listen(...args)
}
module.exports = Application