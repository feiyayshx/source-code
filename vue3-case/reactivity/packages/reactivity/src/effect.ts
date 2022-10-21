// 暴露当前的effect
export let activeEffect = undefined

function cleanupEffect(effect) {
    let deps = effect.deps
    for(let i = 0; i < deps.length;i++) {
        deps[i].delete(effect)
    }
    effect.deps.length = 0;
}

// ts语法定义的类
export class ReactiveEffect {
    // 激活状态
    public active = true
    // 记录父级的effect
    public parent = null
    // effect中用了哪些属性，后续清理时要用
    public deps = []
    constructor(public fn,public scheduler) {}
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
                // 每次收集依赖前先清理现有effect中收集的属性，解决分支切换中无效的依赖收集
                cleanupEffect(this)
                this.fn()
            }finally{
                // fn执行完毕,将activeEffect回退到外层
                activeEffect = this.parent
                this.parent = null
            }
        }
       
       
    }
    stop() {
        if(this.active) {
            this.active = false
            cleanupEffect(this)
        }
    }
}

// 依赖收集原理：借助js单线程的特点，调用effect()时会调用proxy的get,在get里面让属性关联effect,
// 关联的数据结构WeakMap, 例如：{target: {name:[effect,effect],date:[effect,effect]}}
// target是对象，对应的值是Map类型; name是Map中的一个key,对应的值是Set类型，存储不重复的effect
// 收集时需要知道某个对象中的某个属性对应哪个effect(一个属性可能对应多个effect)
const targetMap = new WeakMap()

// 触发更新：找到effect,然后执行
export function trigger(target,key,value) {
    let depsMap = targetMap.get(target)
    // 属性没有依赖任何effect
    if(!depsMap) return

    // 找到effect，然后执行
    let effects = depsMap.get(key)
    // 此处需要拷贝一个新的effects,防止对同一个集合变量删除又添加导致无限循环
    if(effects) {
        effects = new Set(effects)
        effects.forEach(effect => {
            // 这里做了判断，是为了防止重复执行当前effect
            if(effect!==activeEffect) {
                if(effect.scheduler) {
                    effect.scheduler()
                } else {
                    effect.run()
                }
            }
        })
    }
}

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

export function effect(fn, options = {} as any) {

    // 将用户传递的函数变成响应式的effect
    const _effect = new ReactiveEffect(fn, options.scheduler)
    // 初始化时就执行一次effect回调
    _effect.run()
    // 更改runner中的this
    const runner = _effect.run.bind(_effect)
    runner.effect = _effect
    return runner
}

