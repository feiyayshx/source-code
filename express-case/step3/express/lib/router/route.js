const Layer = require("./layer")

function Route() {
  this.stack = []
}

Route.prototype.get = function(handlers) {
  handlers.forEach(handler => {
    const layer = new Layer('',handler)
    this.stack.push(layer)
  })
}
Route.prototype.dispatch = function(req,res,out) {
  // 遍历当前layer，让它依次执行
  let idx = 0;
  const next = () => {
    if(this.stack.length === idx) out()
    let layer = this.stack[idx++]
    layer.handle_request(req,res,out)
  }
  next()
}
module.exports = Route