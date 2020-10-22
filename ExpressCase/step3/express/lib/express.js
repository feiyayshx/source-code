

const Application = require('./application')

// 创建一个服务应用,并封装应用
function createApplication() {
  let app = new Application()
  return app
}

module.exports = createApplication