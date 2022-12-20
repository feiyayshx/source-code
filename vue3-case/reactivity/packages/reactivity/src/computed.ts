import { isFunction } from "@vue/shared"
import { ReactiveEffect, trackEffects, triggerEffects } from './effect'

class ComputedRefImpl {
  public effect;
  public _dirty = true
  public __v_isReadonly = true
  public __v_isRef = true
  public _value;
  public dep = new Set;
  constructor(getter,public setter) {
    this.effect = new ReactiveEffect(getter, ()=> {
      // 依赖的属性发生变化，执行此调度函数
      if(!this._dirty) {
        this._dirty = true
        // 触发更新
        triggerEffects(this.dep);
      }
    })
  }
  // 属性访问器
  get value() {
    // 依赖收集
    trackEffects(this.dep)
    if(this._dirty) {
      this._dirty = false
      this._value = this.effect.run()
    }
    return this._value
  }
  set value(newValue) {
    this.setter(newValue)
  }
}

export const computed = (getterOrOptions) => {
  let onlyGetter = isFunction(getterOrOptions)
  let getter;
  let setter;
  if(onlyGetter) {
    // getter函数
    getter = getterOrOptions
    setter = ()=> {console.warn('no set')}
  }else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }
  return new ComputedRefImpl(getter, setter)
}