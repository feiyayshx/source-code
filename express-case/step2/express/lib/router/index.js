const url = require('url')

function Router() {
  this._router = []
}
Router.prototype.get = function (path, callback) {
  this._router.push({
    path,
    method: 'get',
    handler: callback
  })
}
Router.prototype.handle = function (req, res, done) {
  let { pathname } = url.parse(req.url)
  let reqMethod = req.method.toLowerCase()
  for (let i = 0; i < this._router.length; i++) {
    let { path, method, handler } = this._router[i]
    if (pathname === path && reqMethod === method) {
      return handler(req, res)
    }
  }
  // 匹配不到路由，则默认执行第一个
  done()
}
module.exports = Router