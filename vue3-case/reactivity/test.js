// 例子
let user = {
    firstName: 'tom',
    get fullName() { // 属性访问器
        return this.firstName + 'jack'
    }
}

// user的代理对象
const userProxy = new Proxy(user, {
    get(target,key,receiver) {
        console.log(key,'get')
        return target[key]
    },
    set(target,key,value,receiver) {
        target[key] = value
        return true
    }
})

// 修改后
// const userProxy = new Proxy(user, {
//     get(target,key,receiver) {
//         console.log(key,'get')
//         return Reflect.get(target,key,receiver)
//     },
//     set(target,key,value,receiver) {
//         target[key] = value
//         return Reflect.set(target,key,value,receiver)
//     }
// })

// 访问代理对象firstName属性，会触发get
userProxy.firstName

// 访问fullName属性时，触发一次get, 但是fullName属性是基于firstName属性，理论上应该去代理对象上访问firstName再次触发get,实际上并没有，这样会导致firstName修改后，
// 后期页面不能重新渲染。
// 解决方法：使用Reflect,将原对象中的this指向代理对象
userProxy.fullName

