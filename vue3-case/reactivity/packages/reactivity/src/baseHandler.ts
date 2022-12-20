
export const enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive'
}

import { isObject } from "@vue/shared";
import { reactive } from "./reactive";
import { track, trigger } from "./effect";

export const mutableHandlers = {
    get(target,key,receiver) {
        if(key === ReactiveFlags.IS_REACTIVE) {
            return true
        }
        // 依赖收集：将key与当前的effect实例关联
        track(target,key)
        // 此处需要使用Reflect
        let res = Reflect.get(target,key,receiver)
        if(isObject(res)) {
            // 深度代理
            return reactive(res)
        }
        return res
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