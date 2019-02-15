"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var VerifyError =
/*#__PURE__*/
function (_Error) {
  _inherits(VerifyError, _Error);

  function VerifyError(name, message, errorStatus) {
    var _this;

    _classCallCheck(this, VerifyError);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(VerifyError).call(this));
    _this.name = name || 'Verify Error';
    _this.status = errorStatus;
    _this.messageId = message.messageId || message.error;
    _this.messageDescription = message.messageDescription || message.error_description;
    _this.message = message;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(_assertThisInitialized(_assertThisInitialized(_this)), VerifyError);
    }

    return _this;
  }

  return VerifyError;
}(_wrapNativeSuper(Error));

var _default = VerifyError;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9lcnJvcnMvVmVyaWZ5RXJyb3IuanMiXSwibmFtZXMiOlsiVmVyaWZ5RXJyb3IiLCJuYW1lIiwibWVzc2FnZSIsImVycm9yU3RhdHVzIiwic3RhdHVzIiwibWVzc2FnZUlkIiwiZXJyb3IiLCJtZXNzYWdlRGVzY3JpcHRpb24iLCJlcnJvcl9kZXNjcmlwdGlvbiIsIkVycm9yIiwiY2FwdHVyZVN0YWNrVHJhY2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBQU1BLFc7Ozs7O0FBQ0osdUJBQVlDLElBQVosRUFBa0JDLE9BQWxCLEVBQTJCQyxXQUEzQixFQUF3QztBQUFBOztBQUFBOztBQUN0QztBQUNBLFVBQUtGLElBQUwsR0FBWUEsSUFBSSxJQUFJLGNBQXBCO0FBQ0EsVUFBS0csTUFBTCxHQUFjRCxXQUFkO0FBQ0EsVUFBS0UsU0FBTCxHQUFpQkgsT0FBTyxDQUFDRyxTQUFSLElBQXFCSCxPQUFPLENBQUNJLEtBQTlDO0FBQ0EsVUFBS0Msa0JBQUwsR0FBMEJMLE9BQU8sQ0FBQ0ssa0JBQVIsSUFBOEJMLE9BQU8sQ0FBQ00saUJBQWhFO0FBQ0EsVUFBS04sT0FBTCxHQUFlQSxPQUFmOztBQUVBLFFBQUlPLEtBQUssQ0FBQ0MsaUJBQVYsRUFBNkI7QUFDM0JELE1BQUFBLEtBQUssQ0FBQ0MsaUJBQU4sd0RBQThCVixXQUE5QjtBQUNEOztBQVZxQztBQVd2Qzs7O21CQVp1QlMsSzs7ZUFlWFQsVyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFZlcmlmeUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihuYW1lLCBtZXNzYWdlLCBlcnJvclN0YXR1cykge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5uYW1lID0gbmFtZSB8fCAnVmVyaWZ5IEVycm9yJztcbiAgICB0aGlzLnN0YXR1cyA9IGVycm9yU3RhdHVzO1xuICAgIHRoaXMubWVzc2FnZUlkID0gbWVzc2FnZS5tZXNzYWdlSWQgfHwgbWVzc2FnZS5lcnJvcjtcbiAgICB0aGlzLm1lc3NhZ2VEZXNjcmlwdGlvbiA9IG1lc3NhZ2UubWVzc2FnZURlc2NyaXB0aW9uIHx8IG1lc3NhZ2UuZXJyb3JfZGVzY3JpcHRpb247XG4gICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcblxuICAgIGlmIChFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSkge1xuICAgICAgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgVmVyaWZ5RXJyb3IpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBWZXJpZnlFcnJvcjtcbiJdfQ==