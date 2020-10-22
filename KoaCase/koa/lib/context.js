
const proto = module.exports = {}

function setter(target,key) {
  proto.__defineSetter__(key,function(value){
    this[target][key] = value
  })
}

function getter(target,key) {
  proto.__defineGetter__(key,function(){
    return this[target][key]
  })
}

getter('request','url')
getter('request','path')

setter('response','body')
getter('response','body')