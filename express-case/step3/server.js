const express = require('./express')

const app = express()
/**
 * 1. 每个路由都有一个layer, layer中存着path,dispatch;
 * 2. 每个layer都有一个route,route中存储真正的回调;
 * 3. 
*/
app.get('/', function (req, res, next) {
  res.end('hello express')
  console.log(1)
  next()
}, function (req, res, next) {
  console.log(2)
  next()
}, function (req, res, next) {
  console.log(3)
  next()
})
app.get('/home', function (req, res, next) {
  console.log('home')
  res.send('hello ex')
  next()
});
app.listen(3001, function () {
  console.log('service start 3001')
})