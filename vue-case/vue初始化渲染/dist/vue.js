(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var oldArrayProtoMethods = Array.prototype;
  /* 创建一个新对象，新对象的原型对象指向参数对象Array.prototype */

  var arrayMethods = Object.create(Array.prototype);
  var methods = ['push', 'pop', 'shift', 'unshift', 'splice', 'reverse', 'sort']; // AOP 切片编程

  methods.forEach(function (method) {
    // 给新对象添加数组方法(这些方法都可以改变原始数组)
    arrayMethods[method] = function () {
      var _oldArrayProtoMethods;

      var ob = this.__ob__;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var result = (_oldArrayProtoMethods = oldArrayProtoMethods[method]).call.apply(_oldArrayProtoMethods, [this].concat(args)); // 用户新增的数据也可能是对象格式，需要进行拦截观测


      var inserted;

      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;

        case 'splice':
          inserted = args.slice(2);
      }

      if (inserted) ob.observeArray(inserted);
      return result;
    };
  }); // arrayMethods.push()

  var Observer = /*#__PURE__*/function () {
    // 对value重新定义
    function Observer(value) {
      _classCallCheck(this, Observer);

      // 给响应式数据增加__ob__
      value.__ob__ = this;
      Object.defineProperty(value, '__ob__', {
        value: this,
        enumerable: false,
        // 不可枚举
        configurable: false // 不能删除此属性

      }); // value可能是对象，也可能是数组，分情况处理

      if (Array.isArray(value)) {
        // 观测数组：重写可以改变数组的方法，不使用defineProperty
        Object.setPrototypeOf(value, arrayMethods); // 如果数据中的每项元素也是一个对象，则观测它

        this.observeArray(value);
      } else {
        this.walk(value);
      }
    } // 将数组中的对象变成响应式的


    _createClass(Observer, [{
      key: "observeArray",
      value: function observeArray(value) {
        for (var i = 0; i < value.length; i++) {
          observe(value[i]);
        }
      }
    }, {
      key: "walk",
      value: function walk(data) {
        // 将对象中的每个属性,重新定义成响应式的
        Object.keys(data).forEach(function (key) {
          defineReactive(data, key, data[key]);
        });
      }
    }]);

    return Observer;
  }(); // 定义一个方法，调用defineProperty 来观测数据，可以复用该方法


  function defineReactive(data, key, value) {
    // 如果value也是对象，递归观测对象
    observe(value);
    Object.defineProperty(data, key, {
      get: function get() {
        return value;
      },
      set: function set(newValue) {
        if (newValue === value) return; // 如果设置的值是个对象，将对象变成响应式

        observe(newValue);
        value = newValue;
      }
    });
  } // 创建observe构造函数，实现数据观测

  function observe(data) {
    // 只对对象进行观测，不是对象无法观测
    if (_typeof(data) !== 'object' || data === null) {
      return;
    } // 如果数据被观测过，直接返回


    if (data.__ob__) return; // 通过类实现对数据的观测，因为类方便扩展

    return new Observer(data);
  }

  function initState(vm) {
    // 获取用户传入的options数据，数据类型可能是data,props,methods,computed,watch等
    var opts = vm.$options; // 此处加入是data数据

    if (opts.data) {
      initData(vm);
    }
  }

  function proxy(vm, source, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[source][key];
      },
      set: function set(newValue) {
        vm[source][key] = newValue;
      }
    });
  }

  function initData(vm) {
    // 劫持数据
    var data = vm.$options.data; // 对data进行判断，如果是函数，获取返回值，否则直接获取数据

    /* 设置vm._data 实现通过vm获取data */

    data = vm._data = typeof data === 'function' ? data.call(vm) : data; // 将_data中的数据全部代理到vm上

    for (var key in data) {
      // 例如：取vm.name 实际上就是取vm._data.name
      proxy(vm, '_data', key);
    } // 观测数据data,调用Object.defineProperty()


    observe(data);
  }

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; // aa-aa 

  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); //aa:aa

  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 可以匹配到标签名  [1]

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); //[0] 标签的结束名字
  //    style="xxx"   style='xxx'  style=xxx

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
  var startTagClose = /^\s*(\/?)>/;
  function parseHTML(html) {
    var root = null;
    var currentParent;
    var stack = [];

    while (html) {
      var textEnd = html.indexOf('<');

      if (textEnd == 0) {
        var startTagMatch = parseStartTag();
        console.log(startTagMatch, 'startTagMatch'); // {tagName:"div",attrs:[{name:'id',value:'app'},...]}

        if (startTagMatch) {
          // 开始标签存在,生成ast语法树
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        } // 结束标签 


        var endTagMatch = html.match(endTag);

        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]);
          continue;
        }
      }

      var text = void 0;

      if (textEnd > 0) {
        // 开始解析文本
        text = html.substring(0, textEnd);
      }

      if (text) {
        advance(text.length);
        chars(text);
      }
    }
    /**
    * @return {Object}
    * @desc 匹配开始标签，返回标签名及其属性集合
    */


    function parseStartTag() {
      // ['<div','div',...]
      var start = html.match(startTagOpen);

      if (start) {
        var match = {
          tagName: start[1],
          attrs: []
        }; // 删除匹配过的标签

        advance(start[0].length); // 获取元素 
        // 查找属性

        var _end, attr; //不是开头标签结尾就一直解析


        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length); // a=1 a="1" a='1'

          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5] || true
          });
        }

        if (_end) {
          advance(_end[0].length);
          return match;
        }
      }
    }

    function advance(n) {
      html = html.substring(n);
    } // 根据开始标签 结束标签 文本内容 生成一个ast语法树


    function start(tagName, attrs) {
      // [div]
      var element = createASTElement(tagName, attrs);

      if (!root) {
        root = element;
      }

      currentParent = element; // div>span>a   div  span

      stack.push(element);
    }

    function createASTElement(tag, attrs) {
      // vue3里面支持多个根元素 (外层加了一个空元素) vue2中只有一个根节点
      return {
        tag: tag,
        type: 1,
        children: [],
        attrs: attrs,
        parent: null
      };
    }

    function end(tagName) {
      var element = stack.pop();
      currentParent = stack[stack.length - 1];

      if (currentParent) {
        element.parent = currentParent;
        currentParent.children.push(element);
      }
    }

    function chars(text) {
      text = text.replace(/\s/g, '');

      if (text) {
        currentParent.children.push({
          type: 3,
          text: text
        });
      }
    }

    return root;
  }

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

  function genProps(attrs) {
    var str = '';

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i]; // name,value

      if (attr.name === 'style') {
        (function () {
          var obj = {};
          attr.value.split(';').forEach(function (item) {
            var _item$split = item.split(':'),
                _item$split2 = _slicedToArray(_item$split, 2),
                key = _item$split2[0],
                value = _item$split2[1];

            obj[key] = value;
          });
          attr.value = obj; // {style:{color:red}}
        })();
      }

      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ","); // {a:'aaa',a:1,b:2,}
    }

    return "{".concat(str.slice(0, -1), "}");
  }

  function genChildren(el) {
    var children = el.children;

    if (children) {
      return children.map(function (child) {
        return gen(child);
      }).join(',');
    }
  }

  function gen(node) {
    // 区分是元素 还是文本
    if (node.type == 1) {
      return generate(node);
    } else {
      //文本 逻辑不能用 _c来处理
      // 有{{}} 普通文本  混合文本 {{aa}} aaa {{bbb}} ccc
      var text = node.text;

      if (defaultTagRE.test(text)) {
        // _v(_s(name) + 'aa' + _s(age) + '哈哈'）
        var tokens = [];
        var match;
        var index = 0;
        var lastIndex = defaultTagRE.lastIndex = 0;

        while (match = defaultTagRE.exec(text)) {
          // aa {{ age }} haha 
          index = match.index;

          if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          }

          tokens.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        }

        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }

        return "_v(".concat(tokens.join('+'), ")"); // 是带有{{}}
      } else {
        return "_v(".concat(JSON.stringify(text), ")");
      }
    }
  }

  function generate(el) {
    // console.log(el); // 转换成render代码
    var children = genChildren(el);
    var code = "_c('".concat(el.tag, "',").concat(el.attrs.length ? genProps(el.attrs) : 'undefined', " ").concat(children ? ',' + children : '', ")"); // => js代码 html=> js代码  字符串拼接

    return code;
  }
  /* 
  将模版
  <div id="app" a=1 b=2>
      <span style"=color:red">{{name}} <a>hello</a></span>
  </div> 
  编译成下面的代码：
   _c(
      'div',{id:'app',a:1,b:2}
      ,_c(
          'span',
          {style:{color:'red'}}
          ,_s(_v(name)),
          _c(a,undefined,_v('hello'))
          )
  )
  */

  function compileToFunctions(template) {
    // 根据模版生成ast语法树
    var ast = parseHTML(template); // 根据ast 生成code代码

    var code = generate(ast); // 生成render 字符串

    var render = "with(this){ return ".concat(code, "}"); // 将render字符串转为render函数

    var fn = new Function(render);
    return fn;
  }

  var id = 0;

  var Watcher = function Watcher(vm, fn, cb, options) {
    _classCallCheck(this, Watcher);

    this.vm = vm;
    this.fn = fn;
    this.cb = cb;
    this.options = options;
    this.id = id++;
    this.fn();
  };

  function patch() {}

  function lifecycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
      var vm = this; // 首次渲染，需要用虚拟节点来更新真实的dom元素

      vm.$el = patch(vm.$options.$el);
    };
  }
  function mountComponent(vm, el) {
    // 更新组件
    var updateComponent = function updateComponent() {
      // 传入虚拟节点
      vm._update(vm._render());
    }; // vue 通过渲染Watcher 进行渲染,每个组件都有一个渲染Watcher


    new Watcher(vm, updateComponent, function () {}, true);
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this; // 实例上有个属性$options，表示用户传入的所有属性

      vm.$options = options; // 初始化状态

      initState(vm); // 将数据更新到dom

      if (vm.$options.el) {
        vm.$mount(vm.$options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      el = document.querySelector(el);
      var vm = this;
      vm.$options.el = el;
      /**
       * 1. 如果$options 传入的有render,不做任何处理，直接使用render，否则执行2；
       * 2. 如果没有render，判断是否有template，有则将template转换render,否则执行3；
       * 3. 没有render和template，就找外部模版，获取一个template模版，最终转换成render函数；
       * 
      */

      if (!vm.$options.render) {
        var template = vm.$options.template; // 没有template

        if (!template && el) {
          template = el.outerHTML; // 如果浏览器不兼容，考虑创建一个div标签插入到页面
        } // 将template 转换成render()函数


        var render = compileToFunctions(template); // 将生成的render函数绑定到$options上

        vm.$options.render = render;
      }

      mountComponent(vm);
    };
  }

  function createElement(vm, tag) {
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }

    return vnode(vm, tag, data, data.key, children, undefined);
  }
  function createTextVnode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  }

  function vnode(vm, tag, data, key, children, text) {
    return {
      vm: vm,
      tag: tag,
      data: data,
      key: key,
      children: children,
      text: text
    };
  }

  function renderMixin(Vue) {
    // 创建元素的虚拟节点
    Vue.prototype._c = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return createElement.apply(void 0, [this].concat(args));
    }; // 创建文本的虚拟节点


    Vue.prototype._v = function (text) {
      return createTextVnode(text);
    }; // 转化为字符串


    Vue.prototype._s = function (val) {
      return val == null ? '' : _typeof(val) == 'object' ? JSON.stringify(val) : val;
    };

    Vue.prototype._render = function () {
      var vm = this; // 获取编译后的render函数

      var render = vm.$options.render; // 调用render函数，生成虚拟节点,调用时会将变量赋值

      var vnode = render.call(vm);
      return vnode;
    };
  }

  function Vue(options) {
    // 当 new Vue() 时，会执行_init(),进行初始化操作
    this._init(options);
  } // 扩展初始化方法


  initMixin(Vue); // 扩展_update() 方法

  lifecycleMixin(Vue); // 扩展_render() 方法

  renderMixin(Vue);

  return Vue;

})));
//# sourceMappingURL=vue.js.map
