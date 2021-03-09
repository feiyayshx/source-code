
let id = 0;
class Watcher {
  constructor(vm, fn, cb, options) {
    this.vm = vm;
    this.fn = fn;
    this.cb = cb;
    this.options = options
    this.id = id++
    this.fn()
  }
}

export default Watcher