
function Layer(path, handler) {
  this.path = path
  this.handler = handler
}
Layer.prototype.match = function (pathName) {
  return this.path === pathName
}

Layer.prototype.handle_request = function (req, res, next) {
  this.handler(req, res, next)
}
module.exports = Layer