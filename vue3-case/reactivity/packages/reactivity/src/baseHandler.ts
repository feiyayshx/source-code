
export const enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive'
}

import { track } from "./effect";

export const baseHandler = {
    get(target,key,receiver) {
        if(key === ReactiveFlags.IS_REACTIVE) {
            return true
        }
        // 依赖收集：将key与当前的effect实例关联
        track(target,key)
        // 此处需要使用Reflect
        return Reflect.get(target,key,receiver)
    },
    set(target,key,value,receiver) {
        // 此处需要使用Reflect
        return Reflect.set(target,key,value,receiver)
    }
}