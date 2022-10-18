// 暴露当前的effect
export let activEffect = undefined

// ts语法定义的类
export class ReactiveEffect {
    // 激活状态
    public active = true
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
                // 记录父级的effect
                this.parent = activEffect
                // 依赖收集，将属性与effect关联,当执行run时，this就是实例_effect，activEffect缓存当前的effect实例
                activEffect = this
                this.fn()
            }finally{
                // 赋值后，将activEffect清空
                activEffect = this.parent
                this.parent = null
            }
        }
       
       
    }
}

// 依赖收集原理：借助js单线程的特点，调用effect()时会调用proxy的get,在get里面让属性关联effect,
// 关联的数据结构weakmap: {target: {name:[effect,effect],date:[effect,effect]}}
// target -> Map, name->Set
// 某个对象中的某个属性对应哪个effect(一个属性可能对应多个effect)
// weakmap: {key: {name: [effect,effect],date: [effect,effect]} }

const targetMap = new WeakMap()
export function track(target,key) {
    if(activEffect) {
        // 查找对象的值
        let depsMap = targetMap.get(target)
        // 不存在则添加
        if(!depsMap) {
            targetMap.set(target,(depsMap = new Map()))
        }
        // 查找属性
        let deps = depsMap.get(key)
        if(!deps) {
            // 不存在添加
            depsMap.set(key, (deps = new Set()))
        }
        // 是否收集
        let shouldTrack = !deps.has(activEffect)
        if(shouldTrack){
            deps.add(activEffect)
            activEffect.deps.push(deps)
        }
    }
}

export function effect(fn) {

    // 将用户传递的函数变成响应式的effect
    const _effect = new ReactiveEffect(fn)
    // 初始化时就执行一次effect回调
    _effect.run()
}

