// 暴露当前的effect
export let activeEffect = undefined

// ts语法定义的类
export class ReactiveEffect {
    // 激活状态
    public active = true
    // 记录父级的effect
    public parent = null
    // effect中用了哪些属性，后续清理时要用
    public deps = []
    constructor(public fn) {}
    run () {
        if(!this.active) {
            // 非激活状态
            return this.fn()
        } else {
            // 激活状态
            try {
                this.parent = activeEffect
                // 依赖收集，将属性与effect关联,当执行run时，this就是实例_effect，activeEffect缓存当前的effect实例
                activeEffect = this
                this.fn()
            }finally{
                // fn执行完毕,将activeEffect回退到外层
                activeEffect = this.parent
                this.parent = null
            }
        }
       
       
    }
}

// 依赖收集原理：借助js单线程的特点，调用effect()时会调用proxy的get,在get里面让属性关联effect,
// 关联的数据结构WeakMap, 例如：{target: {name:[effect,effect],date:[effect,effect]}}
// target是对象，对应的值是Map类型; name是Map中的一个key,对应的值是Set类型，存储不重复的effect

// 收集时需要知道某个对象中的某个属性对应哪个effect(一个属性可能对应多个effect)
const targetMap = new WeakMap()
export function track(target,key) {
    if(activeEffect) {
        // 查找对象的值
        let depsMap = targetMap.get(target)
        // 对象不存在则添加
        if(!depsMap) {
            targetMap.set(target,(depsMap = new Map()))
        }
        // 查找属性-Set集合
        let deps = depsMap.get(key)
        if(!deps) {
            // 属性不存在添加
            depsMap.set(key, (deps = new Set()))
        }
        // 是否收集
        let shouldTrack = !deps.has(activeEffect)
        if(shouldTrack){
            // 属性关联effect
            deps.add(activeEffect)
            // effect关联属性，让effect记住属性，effect与属性互相关联
            activeEffect.deps.push(deps)
        }
    }
    console.log(targetMap)
}

export function effect(fn) {

    // 将用户传递的函数变成响应式的effect
    const _effect = new ReactiveEffect(fn)
    // 初始化时就执行一次effect回调
    _effect.run()
}

