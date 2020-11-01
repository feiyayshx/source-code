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

  var oldArrayProtoMethods = Array.prototype;
  var arrayMethods = Object.create(Array.prototype);
  var methods = ['push', 'pop', 'shift', 'unshift', 'splice', 'reverse', 'sort']; // AOP 切片编程

  methods.forEach(function (method) {
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
    ovserve(value);
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

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this; // 实例上有个属性$options，表示用户传入的所有属性

      vm.$options = options; // 初始化状态

      initState(vm);
    };
  } // 初始化-》初始化状态-》初始化数据

  function Vue(options) {
    // 当 new Vue() 时，会执行_init(),进行初始化操作
    this._init(options);
  } // 扩展初始化方法


  initMixin(Vue);

  return Vue;

})));
//# sourceMappingURL=vue.js.map
