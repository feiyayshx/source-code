
export const enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive'
}

import { track, trigger } from "./effect";

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
        // 数据变化后，要根据属性找到effect
        let oldValue = target[key]
        if(oldValue !== value) {
            let result = Reflect.set(target,key,value,receiver)
            // 触发更新
            trigger(target,key,value)
            return result
        }
        // 此处需要使用Reflect
        return 
    }
}