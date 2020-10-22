
const http = require('http')
const url = require('url')

const routes = [
  {
    path: '*',
    method: 'all',
    handler: (req, res) => {
      res.end(`Cannot ${req.method} ${req.url}`)
    }
  }
]
// 创建一个服务应用
function createApplication() {
  return {
    // 路由方法
    get(path, callback) {
      routes.push({
        path,
        method: 'get',
        handler: callback
      })
    },
    // 监听请求
    listen(...args) {
      let server = http.createServer(function (req, res) {
        let { pathname } = url.parse(req.url)
        let reqMethod = req.method.toLowerCase()
        for (let i = 0; i < routes.length; i++) {
          let { path, method, handler } = routes[i]
          if (pathname === path && reqMethod === method) {
            return handler(req, res)
          }
        }
        // 匹配不到路由，则默认执行第一个
        routes[0].handler(req, res)
      })

      server.listen(...args)
    }
  }
}

module.exports = createApplication