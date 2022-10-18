import { isObject } from "@vue/shared";
import { ReactiveFlags,baseHandler } from './baseHandler'

// 创建一个缓存代理结果
// WeakMap:弱引用，有利于垃圾回收，key必须是个对象
const reactiveMap = new WeakMap()


export function reactive(target) {
    // target参数必须是个对象
    if(!isObject(target)) {
        return target
    }

    // 如果是原生对象，不会走proxy的get方法
    // 如果是proxy对象会走到get方法，返回true,然后直接返回代理对象
    if(target[ReactiveFlags.IS_REACTIVE]) {
        return target
    }

    const existing = reactiveMap.get(target)
    // 如果目标对象被代理过，直接返回
    if(existing) {
        return existing
    }

    // 代理目标对象（es6中的proxy）
    const proxy = new Proxy(target, baseHandler)

    // 缓存目标对象及其代理对象
    reactiveMap.set(target,proxy)

    return proxy
}



