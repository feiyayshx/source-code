const url = require('url')
const parse = require('parseurl');

// request对象是基于原生req进行的扩展
module.exports = {
  // 此处的this 指向ctx.request，ctx.request上挂载的有原生req对象
  get headers() {
    return this.req.headers
  },
  set headers(val) {
    this.req.headers = val;
  },
  get url() {
    return this.req.url;
  },
  set url(val) {
    this.req.url = val;
  },
  get path() {
    let { pathname } = url.parse(this.req.url)
    return pathname
  },
  set path(path) {
    const url = parse(this.req);
    if (url.pathname === path) return;

    url.pathname = path;
    url.path = null;

    this.url = stringify(url);
  }
}