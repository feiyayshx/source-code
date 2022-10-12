import { isObject } from "@vue/shared";

export function reactive(target) {
    // target参数必须是个对象
    if(!isObject(target)) {
        return target
    }

    // 代理目标对象（es6中的proxy）
    const proxy = new Proxy(target, {
        get(target,key,receiver) {
            return target[key]
        },
        set(target,key,value,receiver) {
            target[key] = value
            return true
        }
    })

    return proxy
}