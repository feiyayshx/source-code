
import { initMixin } from './init.js'

// 创建Vue构造函数
function Vue(options) {
  // 当 new Vue() 时，会执行_init(),进行初始化操作
  this._init(options)
}

// 扩展初始化方法
initMixin(Vue)

export default Vue
