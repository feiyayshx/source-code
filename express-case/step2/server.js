const express = require('./express')

const app = express()

app.get('/', function(req,res) {
  res.end('hello express step2')
})

app.listen(3001,function(){
  console.log('service start 3001')
})