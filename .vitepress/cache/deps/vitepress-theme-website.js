import {
  isDef,
  useDebounceFn,
  useEventListener,
  useNow,
  useScriptTag,
  useStorage,
  useStyleTag,
  watchImmediate
} from "./chunk-F4EMYZVZ.js";
import {
  Fragment,
  computed,
  createApp,
  createBaseVNode,
  createBlock,
  createCommentVNode,
  createElementBlock,
  createTextVNode,
  createVNode,
  defineComponent,
  h,
  inject,
  isRef,
  nextTick,
  normalizeClass,
  normalizeStyle,
  onBeforeUnmount,
  onMounted,
  onUnmounted,
  openBlock,
  provide,
  reactive,
  ref,
  renderList,
  resolveComponent,
  toDisplayString,
  unref,
  useTemplateRef,
  vModelDynamic,
  vModelText,
  vShow,
  watch,
  watchEffect,
  withDirectives
} from "./chunk-CQOUZRMK.js";
import {
  __commonJS,
  __publicField,
  __toESM
} from "./chunk-EQCVQC35.js";

// node_modules/.pnpm/recaptcha-v3@1.11.3/node_modules/recaptcha-v3/dist/ReCaptchaInstance.js
var require_ReCaptchaInstance = __commonJS({
  "node_modules/.pnpm/recaptcha-v3@1.11.3/node_modules/recaptcha-v3/dist/ReCaptchaInstance.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e2) {
            reject(e2);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e2) {
            reject(e2);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __generator = exports && exports.__generator || function(thisArg, body) {
      var _ = { label: 0, sent: function() {
        if (t2[0] & 1) throw t2[1];
        return t2[1];
      }, trys: [], ops: [] }, f2, y2, t2, g;
      return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
      }), g;
      function verb(n2) {
        return function(v2) {
          return step([n2, v2]);
        };
      }
      function step(op) {
        if (f2) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
          if (f2 = 1, y2 && (t2 = op[0] & 2 ? y2["return"] : op[0] ? y2["throw"] || ((t2 = y2["return"]) && t2.call(y2), 0) : y2.next) && !(t2 = t2.call(y2, op[1])).done) return t2;
          if (y2 = 0, t2) op = [op[0] & 2, t2.value];
          switch (op[0]) {
            case 0:
            case 1:
              t2 = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y2 = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (!(t2 = _.trys, t2 = t2.length > 0 && t2[t2.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t2 || op[1] > t2[0] && op[1] < t2[3])) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t2[1]) {
                _.label = t2[1];
                t2 = op;
                break;
              }
              if (t2 && _.label < t2[2]) {
                _.label = t2[2];
                _.ops.push(op);
                break;
              }
              if (t2[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e2) {
          op = [6, e2];
          y2 = 0;
        } finally {
          f2 = t2 = 0;
        }
        if (op[0] & 5) throw op[1];
        return { value: op[0] ? op[1] : void 0, done: true };
      }
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReCaptchaInstance = void 0;
    var ReCaptchaInstance = function() {
      function ReCaptchaInstance2(siteKey, recaptchaID, recaptcha) {
        this.siteKey = siteKey;
        this.recaptchaID = recaptchaID;
        this.recaptcha = recaptcha;
        this.styleContainer = null;
      }
      ReCaptchaInstance2.prototype.execute = function(action) {
        return __awaiter(this, void 0, void 0, function() {
          var _a2;
          return __generator(this, function(_b) {
            switch (_b.label) {
              case 0:
                if (!this.recaptcha.enterprise) return [3, 2];
                return [4, this.recaptcha.enterprise.execute(this.recaptchaID, { action })];
              case 1:
                _a2 = _b.sent();
                return [3, 4];
              case 2:
                return [4, this.recaptcha.execute(this.recaptchaID, { action })];
              case 3:
                _a2 = _b.sent();
                _b.label = 4;
              case 4:
                return [2, _a2];
            }
          });
        });
      };
      ReCaptchaInstance2.prototype.getSiteKey = function() {
        return this.siteKey;
      };
      ReCaptchaInstance2.prototype.hideBadge = function() {
        if (this.styleContainer !== null) {
          return;
        }
        this.styleContainer = document.createElement("style");
        this.styleContainer.innerHTML = ".grecaptcha-badge{visibility:hidden !important;}";
        document.head.appendChild(this.styleContainer);
      };
      ReCaptchaInstance2.prototype.showBadge = function() {
        if (this.styleContainer === null) {
          return;
        }
        document.head.removeChild(this.styleContainer);
        this.styleContainer = null;
      };
      return ReCaptchaInstance2;
    }();
    exports.ReCaptchaInstance = ReCaptchaInstance;
  }
});

// node_modules/.pnpm/recaptcha-v3@1.11.3/node_modules/recaptcha-v3/dist/ReCaptchaLoader.js
var require_ReCaptchaLoader = __commonJS({
  "node_modules/.pnpm/recaptcha-v3@1.11.3/node_modules/recaptcha-v3/dist/ReCaptchaLoader.js"(exports) {
    "use strict";
    var __assign = exports && exports.__assign || function() {
      __assign = Object.assign || function(t2) {
        for (var s2, i = 1, n2 = arguments.length; i < n2; i++) {
          s2 = arguments[i];
          for (var p2 in s2) if (Object.prototype.hasOwnProperty.call(s2, p2))
            t2[p2] = s2[p2];
        }
        return t2;
      };
      return __assign.apply(this, arguments);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getInstance = exports.load = void 0;
    var ReCaptchaInstance_1 = require_ReCaptchaInstance();
    var ELoadingState;
    (function(ELoadingState2) {
      ELoadingState2[ELoadingState2["NOT_LOADED"] = 0] = "NOT_LOADED";
      ELoadingState2[ELoadingState2["LOADING"] = 1] = "LOADING";
      ELoadingState2[ELoadingState2["LOADED"] = 2] = "LOADED";
    })(ELoadingState || (ELoadingState = {}));
    var ReCaptchaLoader = function() {
      function ReCaptchaLoader2() {
      }
      ReCaptchaLoader2.load = function(siteKey, options2) {
        if (options2 === void 0) {
          options2 = {};
        }
        if (typeof document === "undefined") {
          return Promise.reject(new Error("This is a library for the browser!"));
        }
        if (ReCaptchaLoader2.getLoadingState() === ELoadingState.LOADED) {
          if (ReCaptchaLoader2.instance.getSiteKey() === siteKey) {
            return Promise.resolve(ReCaptchaLoader2.instance);
          } else {
            return Promise.reject(new Error("reCAPTCHA already loaded with different site key!"));
          }
        }
        if (ReCaptchaLoader2.getLoadingState() === ELoadingState.LOADING) {
          if (siteKey !== ReCaptchaLoader2.instanceSiteKey) {
            return Promise.reject(new Error("reCAPTCHA already loaded with different site key!"));
          }
          return new Promise(function(resolve, reject) {
            ReCaptchaLoader2.successfulLoadingConsumers.push(function(instance) {
              return resolve(instance);
            });
            ReCaptchaLoader2.errorLoadingRunnable.push(function(reason) {
              return reject(reason);
            });
          });
        }
        ReCaptchaLoader2.instanceSiteKey = siteKey;
        ReCaptchaLoader2.setLoadingState(ELoadingState.LOADING);
        var loader = new ReCaptchaLoader2();
        return new Promise(function(resolve, reject) {
          loader.loadScript(siteKey, options2.useRecaptchaNet || false, options2.useEnterprise || false, options2.renderParameters ? options2.renderParameters : {}, options2.customUrl).then(function() {
            ReCaptchaLoader2.setLoadingState(ELoadingState.LOADED);
            var widgetID = loader.doExplicitRender(grecaptcha, siteKey, options2.explicitRenderParameters ? options2.explicitRenderParameters : {}, options2.useEnterprise || false);
            var instance = new ReCaptchaInstance_1.ReCaptchaInstance(siteKey, widgetID, grecaptcha);
            ReCaptchaLoader2.successfulLoadingConsumers.forEach(function(v2) {
              return v2(instance);
            });
            ReCaptchaLoader2.successfulLoadingConsumers = [];
            if (options2.autoHideBadge) {
              instance.hideBadge();
            }
            ReCaptchaLoader2.instance = instance;
            resolve(instance);
          }).catch(function(error) {
            ReCaptchaLoader2.errorLoadingRunnable.forEach(function(v2) {
              return v2(error);
            });
            ReCaptchaLoader2.errorLoadingRunnable = [];
            reject(error);
          });
        });
      };
      ReCaptchaLoader2.getInstance = function() {
        return ReCaptchaLoader2.instance;
      };
      ReCaptchaLoader2.setLoadingState = function(state) {
        ReCaptchaLoader2.loadingState = state;
      };
      ReCaptchaLoader2.getLoadingState = function() {
        if (ReCaptchaLoader2.loadingState === null) {
          return ELoadingState.NOT_LOADED;
        } else {
          return ReCaptchaLoader2.loadingState;
        }
      };
      ReCaptchaLoader2.prototype.loadScript = function(siteKey, useRecaptchaNet, useEnterprise, renderParameters, customUrl) {
        var _this = this;
        if (useRecaptchaNet === void 0) {
          useRecaptchaNet = false;
        }
        if (useEnterprise === void 0) {
          useEnterprise = false;
        }
        if (renderParameters === void 0) {
          renderParameters = {};
        }
        if (customUrl === void 0) {
          customUrl = "";
        }
        var scriptElement = document.createElement("script");
        scriptElement.setAttribute("recaptcha-v3-script", "");
        scriptElement.setAttribute("async", "");
        scriptElement.setAttribute("defer", "");
        var scriptBase = "https://www.google.com/recaptcha/api.js";
        if (useRecaptchaNet) {
          if (useEnterprise) {
            scriptBase = "https://recaptcha.net/recaptcha/enterprise.js";
          } else {
            scriptBase = "https://recaptcha.net/recaptcha/api.js";
          }
        } else if (useEnterprise) {
          scriptBase = "https://www.google.com/recaptcha/enterprise.js";
        }
        if (customUrl) {
          scriptBase = customUrl;
        }
        if (renderParameters.render) {
          renderParameters.render = void 0;
        }
        var parametersQuery = this.buildQueryString(renderParameters);
        scriptElement.src = scriptBase + "?render=explicit" + parametersQuery;
        return new Promise(function(resolve, reject) {
          scriptElement.addEventListener("load", _this.waitForScriptToLoad(function() {
            resolve(scriptElement);
          }, useEnterprise), false);
          scriptElement.onerror = function(error) {
            ReCaptchaLoader2.setLoadingState(ELoadingState.NOT_LOADED);
            reject(error);
          };
          document.head.appendChild(scriptElement);
        });
      };
      ReCaptchaLoader2.prototype.buildQueryString = function(parameters) {
        var parameterKeys = Object.keys(parameters);
        if (parameterKeys.length < 1) {
          return "";
        }
        return "&" + Object.keys(parameters).filter(function(parameterKey) {
          return !!parameters[parameterKey];
        }).map(function(parameterKey) {
          return parameterKey + "=" + parameters[parameterKey];
        }).join("&");
      };
      ReCaptchaLoader2.prototype.waitForScriptToLoad = function(callback, useEnterprise) {
        var _this = this;
        return function() {
          if (window.grecaptcha === void 0) {
            setTimeout(function() {
              _this.waitForScriptToLoad(callback, useEnterprise);
            }, ReCaptchaLoader2.SCRIPT_LOAD_DELAY);
          } else {
            if (useEnterprise) {
              window.grecaptcha.enterprise.ready(function() {
                callback();
              });
            } else {
              window.grecaptcha.ready(function() {
                callback();
              });
            }
          }
        };
      };
      ReCaptchaLoader2.prototype.doExplicitRender = function(grecaptcha2, siteKey, parameters, isEnterprise) {
        var augmentedParameters = __assign({ sitekey: siteKey }, parameters);
        if (parameters.container) {
          if (isEnterprise) {
            return grecaptcha2.enterprise.render(parameters.container, augmentedParameters);
          } else {
            return grecaptcha2.render(parameters.container, augmentedParameters);
          }
        } else {
          if (isEnterprise) {
            return grecaptcha2.enterprise.render(augmentedParameters);
          } else {
            return grecaptcha2.render(augmentedParameters);
          }
        }
      };
      ReCaptchaLoader2.loadingState = null;
      ReCaptchaLoader2.instance = null;
      ReCaptchaLoader2.instanceSiteKey = null;
      ReCaptchaLoader2.successfulLoadingConsumers = [];
      ReCaptchaLoader2.errorLoadingRunnable = [];
      ReCaptchaLoader2.SCRIPT_LOAD_DELAY = 25;
      return ReCaptchaLoader2;
    }();
    exports.load = ReCaptchaLoader.load;
    exports.getInstance = ReCaptchaLoader.getInstance;
  }
});

// node_modules/.pnpm/recaptcha-v3@1.11.3/node_modules/recaptcha-v3/dist/ReCaptcha.js
var require_ReCaptcha = __commonJS({
  "node_modules/.pnpm/recaptcha-v3@1.11.3/node_modules/recaptcha-v3/dist/ReCaptcha.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReCaptchaInstance = exports.getInstance = exports.load = void 0;
    var ReCaptchaLoader_1 = require_ReCaptchaLoader();
    Object.defineProperty(exports, "load", { enumerable: true, get: function() {
      return ReCaptchaLoader_1.load;
    } });
    Object.defineProperty(exports, "getInstance", { enumerable: true, get: function() {
      return ReCaptchaLoader_1.getInstance;
    } });
    var ReCaptchaInstance_1 = require_ReCaptchaInstance();
    Object.defineProperty(exports, "ReCaptchaInstance", { enumerable: true, get: function() {
      return ReCaptchaInstance_1.ReCaptchaInstance;
    } });
  }
});

// node_modules/.pnpm/vitepress-theme-website@1.0.8/node_modules/vitepress-theme-website/dist/waline/index.mjs
import { useRoute } from "vitepress";

// node_modules/.pnpm/@waline+api@1.0.0/node_modules/@waline/api/dist/api.js
var m = { "Content-Type": "application/json" };
var s = (e2) => `${e2.replace(/\/?$/, "/")}api/`;
var c = (e2, n2 = "") => {
  if (typeof e2 == "object" && e2.errno) throw new TypeError(`${n2} failed with ${e2.errno}: ${e2.errmsg}`);
  return e2;
};
var p = ({ serverURL: e2, lang: n2, paths: o2, type: a, signal: t2 }) => fetch(`${s(e2)}article?path=${encodeURIComponent(o2.join(","))}&type=${encodeURIComponent(a.join(","))}&lang=${n2}`, { signal: t2 }).then((r2) => r2.json()).then((r2) => c(r2, "Get counter").data);
var d = ({ serverURL: e2, lang: n2, path: o2, type: a, action: t2 }) => fetch(`${s(e2)}article?lang=${n2}`, { method: "POST", headers: m, body: JSON.stringify({ path: o2, type: a, action: t2 }) }).then((r2) => r2.json()).then((r2) => c(r2, "Update counter").data);
var $ = ({ serverURL: e2, lang: n2, path: o2, page: a, pageSize: t2, sortBy: r2, signal: h2, token: i }) => {
  const l = {};
  return i && (l.Authorization = `Bearer ${i}`), fetch(`${s(e2)}comment?path=${encodeURIComponent(o2)}&pageSize=${t2}&page=${a}&lang=${n2}&sortBy=${r2}`, { signal: h2, headers: l }).then((g) => g.json()).then((g) => c(g, "Get comment data").data);
};
var u = ({ serverURL: e2, lang: n2, token: o2, comment: a }) => {
  const t2 = { "Content-Type": "application/json" };
  return o2 && (t2.Authorization = `Bearer ${o2}`), fetch(`${s(e2)}comment?lang=${n2}`, { method: "POST", headers: t2, body: JSON.stringify(a) }).then((r2) => r2.json());
};
var y = ({ serverURL: e2, lang: n2, token: o2, objectId: a }) => fetch(`${s(e2)}comment/${a}?lang=${n2}`, { method: "DELETE", headers: { Authorization: `Bearer ${o2}` } }).then((t2) => t2.json()).then((t2) => c(t2, "Delete comment"));
var U = ({ serverURL: e2, lang: n2, token: o2, objectId: a, comment: t2 }) => fetch(`${s(e2)}comment/${a}?lang=${n2}`, { method: "PUT", headers: { ...m, Authorization: `Bearer ${o2}` }, body: JSON.stringify(t2) }).then((r2) => r2.json()).then((r2) => c(r2, "Update comment"));
var f = ({ serverURL: e2, lang: n2, paths: o2, signal: a }) => fetch(`${s(e2)}comment?type=count&url=${encodeURIComponent(o2.join(","))}&lang=${n2}`, { signal: a }).then((t2) => t2.json()).then((t2) => c(t2, "Get comment count").data);
var R = ({ lang: e2, serverURL: n2 }) => {
  const o2 = (window.innerWidth - 450) / 2, a = (window.innerHeight - 450) / 2, t2 = window.open(`${n2.replace(/\/$/, "")}/ui/login?lng=${encodeURIComponent(e2)}`, "_blank", `width=450,height=450,left=${o2},top=${a},scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no`);
  return t2 == null ? void 0 : t2.postMessage({ type: "TOKEN", data: null }, "*"), new Promise((r2) => {
    const h2 = ({ data: i }) => {
      !i || typeof i != "object" || i.type !== "userInfo" || i.data.token && (t2 == null ? void 0 : t2.close(), window.removeEventListener("message", h2), r2(i.data));
    };
    window.addEventListener("message", h2);
  });
};
var j = ({ serverURL: e2, lang: n2, paths: o2, signal: a }) => p({ serverURL: e2, lang: n2, paths: o2, type: ["time"], signal: a });
var v = (e2) => d({ ...e2, type: "time", action: "inc" });

// node_modules/.pnpm/autosize@6.0.1/node_modules/autosize/dist/autosize.esm.js
var e = /* @__PURE__ */ new Map();
function t(t2) {
  var o2 = e.get(t2);
  o2 && o2.destroy();
}
function o(t2) {
  var o2 = e.get(t2);
  o2 && o2.update();
}
var r = null;
"undefined" == typeof window ? ((r = function(e2) {
  return e2;
}).destroy = function(e2) {
  return e2;
}, r.update = function(e2) {
  return e2;
}) : ((r = function(t2, o2) {
  return t2 && Array.prototype.forEach.call(t2.length ? t2 : [t2], function(t3) {
    return function(t4) {
      if (t4 && t4.nodeName && "TEXTAREA" === t4.nodeName && !e.has(t4)) {
        var o3, r2 = null, n2 = window.getComputedStyle(t4), i = (o3 = t4.value, function() {
          a({ testForHeightReduction: "" === o3 || !t4.value.startsWith(o3), restoreTextAlign: null }), o3 = t4.value;
        }), l = (function(o4) {
          t4.removeEventListener("autosize:destroy", l), t4.removeEventListener("autosize:update", s2), t4.removeEventListener("input", i), window.removeEventListener("resize", s2), Object.keys(o4).forEach(function(e2) {
            return t4.style[e2] = o4[e2];
          }), e.delete(t4);
        }).bind(t4, { height: t4.style.height, resize: t4.style.resize, textAlign: t4.style.textAlign, overflowY: t4.style.overflowY, overflowX: t4.style.overflowX, wordWrap: t4.style.wordWrap });
        t4.addEventListener("autosize:destroy", l), t4.addEventListener("autosize:update", s2), t4.addEventListener("input", i), window.addEventListener("resize", s2), t4.style.overflowX = "hidden", t4.style.wordWrap = "break-word", e.set(t4, { destroy: l, update: s2 }), s2();
      }
      function a(e2) {
        var o4, i2, l2 = e2.restoreTextAlign, s3 = void 0 === l2 ? null : l2, d2 = e2.testForHeightReduction, u2 = void 0 === d2 || d2, c2 = n2.overflowY;
        if (0 !== t4.scrollHeight && ("vertical" === n2.resize ? t4.style.resize = "none" : "both" === n2.resize && (t4.style.resize = "horizontal"), u2 && (o4 = function(e3) {
          for (var t5 = []; e3 && e3.parentNode && e3.parentNode instanceof Element; ) e3.parentNode.scrollTop && t5.push([e3.parentNode, e3.parentNode.scrollTop]), e3 = e3.parentNode;
          return function() {
            return t5.forEach(function(e4) {
              var t6 = e4[0], o5 = e4[1];
              t6.style.scrollBehavior = "auto", t6.scrollTop = o5, t6.style.scrollBehavior = null;
            });
          };
        }(t4), t4.style.height = ""), i2 = "content-box" === n2.boxSizing ? t4.scrollHeight - (parseFloat(n2.paddingTop) + parseFloat(n2.paddingBottom)) : t4.scrollHeight + parseFloat(n2.borderTopWidth) + parseFloat(n2.borderBottomWidth), "none" !== n2.maxHeight && i2 > parseFloat(n2.maxHeight) ? ("hidden" === n2.overflowY && (t4.style.overflow = "scroll"), i2 = parseFloat(n2.maxHeight)) : "hidden" !== n2.overflowY && (t4.style.overflow = "hidden"), t4.style.height = i2 + "px", s3 && (t4.style.textAlign = s3), o4 && o4(), r2 !== i2 && (t4.dispatchEvent(new Event("autosize:resized", { bubbles: true })), r2 = i2), c2 !== n2.overflow && !s3)) {
          var v2 = n2.textAlign;
          "hidden" === n2.overflow && (t4.style.textAlign = "start" === v2 ? "end" : "start"), a({ restoreTextAlign: v2, testForHeightReduction: true });
        }
      }
      function s2() {
        a({ testForHeightReduction: true, restoreTextAlign: null });
      }
    }(t3);
  }), t2;
}).destroy = function(e2) {
  return e2 && Array.prototype.forEach.call(e2.length ? e2 : [e2], t), e2;
}, r.update = function(e2) {
  return e2 && Array.prototype.forEach.call(e2.length ? e2 : [e2], o), e2;
});
var n = r;
var autosize_esm_default = n;

// node_modules/.pnpm/marked@15.0.7/node_modules/marked/lib/marked.esm.js
function _getDefaults() {
  return {
    async: false,
    breaks: false,
    extensions: null,
    gfm: true,
    hooks: null,
    pedantic: false,
    renderer: null,
    silent: false,
    tokenizer: null,
    walkTokens: null
  };
}
var _defaults = _getDefaults();
function changeDefaults(newDefaults) {
  _defaults = newDefaults;
}
var noopTest = { exec: () => null };
function edit(regex, opt = "") {
  let source = typeof regex === "string" ? regex : regex.source;
  const obj = {
    replace: (name, val) => {
      let valSource = typeof val === "string" ? val : val.source;
      valSource = valSource.replace(other.caret, "$1");
      source = source.replace(name, valSource);
      return obj;
    },
    getRegex: () => {
      return new RegExp(source, opt);
    }
  };
  return obj;
}
var other = {
  codeRemoveIndent: /^(?: {1,4}| {0,3}\t)/gm,
  outputLinkReplace: /\\([\[\]])/g,
  indentCodeCompensation: /^(\s+)(?:```)/,
  beginningSpace: /^\s+/,
  endingHash: /#$/,
  startingSpaceChar: /^ /,
  endingSpaceChar: / $/,
  nonSpaceChar: /[^ ]/,
  newLineCharGlobal: /\n/g,
  tabCharGlobal: /\t/g,
  multipleSpaceGlobal: /\s+/g,
  blankLine: /^[ \t]*$/,
  doubleBlankLine: /\n[ \t]*\n[ \t]*$/,
  blockquoteStart: /^ {0,3}>/,
  blockquoteSetextReplace: /\n {0,3}((?:=+|-+) *)(?=\n|$)/g,
  blockquoteSetextReplace2: /^ {0,3}>[ \t]?/gm,
  listReplaceTabs: /^\t+/,
  listReplaceNesting: /^ {1,4}(?=( {4})*[^ ])/g,
  listIsTask: /^\[[ xX]\] /,
  listReplaceTask: /^\[[ xX]\] +/,
  anyLine: /\n.*\n/,
  hrefBrackets: /^<(.*)>$/,
  tableDelimiter: /[:|]/,
  tableAlignChars: /^\||\| *$/g,
  tableRowBlankLine: /\n[ \t]*$/,
  tableAlignRight: /^ *-+: *$/,
  tableAlignCenter: /^ *:-+: *$/,
  tableAlignLeft: /^ *:-+ *$/,
  startATag: /^<a /i,
  endATag: /^<\/a>/i,
  startPreScriptTag: /^<(pre|code|kbd|script)(\s|>)/i,
  endPreScriptTag: /^<\/(pre|code|kbd|script)(\s|>)/i,
  startAngleBracket: /^</,
  endAngleBracket: />$/,
  pedanticHrefTitle: /^([^'"]*[^\s])\s+(['"])(.*)\2/,
  unicodeAlphaNumeric: /[\p{L}\p{N}]/u,
  escapeTest: /[&<>"']/,
  escapeReplace: /[&<>"']/g,
  escapeTestNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,
  escapeReplaceNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,
  unescapeTest: /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig,
  caret: /(^|[^\[])\^/g,
  percentDecode: /%25/g,
  findPipe: /\|/g,
  splitPipe: / \|/,
  slashPipe: /\\\|/g,
  carriageReturn: /\r\n|\r/g,
  spaceLine: /^ +$/gm,
  notSpaceStart: /^\S*/,
  endingNewline: /\n$/,
  listItemRegex: (bull) => new RegExp(`^( {0,3}${bull})((?:[	 ][^\\n]*)?(?:\\n|$))`),
  nextBulletRegex: (indent) => new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),
  hrRegex: (indent) => new RegExp(`^ {0,${Math.min(3, indent - 1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),
  fencesBeginRegex: (indent) => new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:\`\`\`|~~~)`),
  headingBeginRegex: (indent) => new RegExp(`^ {0,${Math.min(3, indent - 1)}}#`),
  htmlBeginRegex: (indent) => new RegExp(`^ {0,${Math.min(3, indent - 1)}}<(?:[a-z].*>|!--)`, "i")
};
var newline = /^(?:[ \t]*(?:\n|$))+/;
var blockCode = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/;
var fences = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/;
var hr = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/;
var heading = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/;
var bullet = /(?:[*+-]|\d{1,9}[.)])/;
var lheadingCore = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/;
var lheading = edit(lheadingCore).replace(/bull/g, bullet).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex();
var lheadingGfm = edit(lheadingCore).replace(/bull/g, bullet).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex();
var _paragraph = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/;
var blockText = /^[^\n]+/;
var _blockLabel = /(?!\s*\])(?:\\.|[^\[\]\\])+/;
var def = edit(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", _blockLabel).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex();
var list = edit(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g, bullet).getRegex();
var _tag = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul";
var _comment = /<!--(?:-?>|[\s\S]*?(?:-->|$))/;
var html = edit("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))", "i").replace("comment", _comment).replace("tag", _tag).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();
var paragraph = edit(_paragraph).replace("hr", hr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", _tag).getRegex();
var blockquote = edit(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", paragraph).getRegex();
var blockNormal = {
  blockquote,
  code: blockCode,
  def,
  fences,
  heading,
  hr,
  html,
  lheading,
  list,
  newline,
  paragraph,
  table: noopTest,
  text: blockText
};
var gfmTable = edit("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr", hr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", _tag).getRegex();
var blockGfm = {
  ...blockNormal,
  lheading: lheadingGfm,
  table: gfmTable,
  paragraph: edit(_paragraph).replace("hr", hr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", gfmTable).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", _tag).getRegex()
};
var blockPedantic = {
  ...blockNormal,
  html: edit(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment", _comment).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
  heading: /^(#{1,6})(.*)(?:\n+|$)/,
  fences: noopTest,
  // fences not supported
  lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
  paragraph: edit(_paragraph).replace("hr", hr).replace("heading", " *#{1,6} *[^\n]").replace("lheading", lheading).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex()
};
var escape$1 = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/;
var inlineCode = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/;
var br = /^( {2,}|\\)\n(?!\s*$)/;
var inlineText = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/;
var _punctuation = /[\p{P}\p{S}]/u;
var _punctuationOrSpace = /[\s\p{P}\p{S}]/u;
var _notPunctuationOrSpace = /[^\s\p{P}\p{S}]/u;
var punctuation = edit(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, _punctuationOrSpace).getRegex();
var _punctuationGfmStrongEm = /(?!~)[\p{P}\p{S}]/u;
var _punctuationOrSpaceGfmStrongEm = /(?!~)[\s\p{P}\p{S}]/u;
var _notPunctuationOrSpaceGfmStrongEm = /(?:[^\s\p{P}\p{S}]|~)/u;
var blockSkip = /\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g;
var emStrongLDelimCore = /^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/;
var emStrongLDelim = edit(emStrongLDelimCore, "u").replace(/punct/g, _punctuation).getRegex();
var emStrongLDelimGfm = edit(emStrongLDelimCore, "u").replace(/punct/g, _punctuationGfmStrongEm).getRegex();
var emStrongRDelimAstCore = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)";
var emStrongRDelimAst = edit(emStrongRDelimAstCore, "gu").replace(/notPunctSpace/g, _notPunctuationOrSpace).replace(/punctSpace/g, _punctuationOrSpace).replace(/punct/g, _punctuation).getRegex();
var emStrongRDelimAstGfm = edit(emStrongRDelimAstCore, "gu").replace(/notPunctSpace/g, _notPunctuationOrSpaceGfmStrongEm).replace(/punctSpace/g, _punctuationOrSpaceGfmStrongEm).replace(/punct/g, _punctuationGfmStrongEm).getRegex();
var emStrongRDelimUnd = edit("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)", "gu").replace(/notPunctSpace/g, _notPunctuationOrSpace).replace(/punctSpace/g, _punctuationOrSpace).replace(/punct/g, _punctuation).getRegex();
var anyPunctuation = edit(/\\(punct)/, "gu").replace(/punct/g, _punctuation).getRegex();
var autolink = edit(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex();
var _inlineComment = edit(_comment).replace("(?:-->|$)", "-->").getRegex();
var tag = edit("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment", _inlineComment).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex();
var _inlineLabel = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;
var link = edit(/^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/).replace("label", _inlineLabel).replace("href", /<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex();
var reflink = edit(/^!?\[(label)\]\[(ref)\]/).replace("label", _inlineLabel).replace("ref", _blockLabel).getRegex();
var nolink = edit(/^!?\[(ref)\](?:\[\])?/).replace("ref", _blockLabel).getRegex();
var reflinkSearch = edit("reflink|nolink(?!\\()", "g").replace("reflink", reflink).replace("nolink", nolink).getRegex();
var inlineNormal = {
  _backpedal: noopTest,
  // only used for GFM url
  anyPunctuation,
  autolink,
  blockSkip,
  br,
  code: inlineCode,
  del: noopTest,
  emStrongLDelim,
  emStrongRDelimAst,
  emStrongRDelimUnd,
  escape: escape$1,
  link,
  nolink,
  punctuation,
  reflink,
  reflinkSearch,
  tag,
  text: inlineText,
  url: noopTest
};
var inlinePedantic = {
  ...inlineNormal,
  link: edit(/^!?\[(label)\]\((.*?)\)/).replace("label", _inlineLabel).getRegex(),
  reflink: edit(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", _inlineLabel).getRegex()
};
var inlineGfm = {
  ...inlineNormal,
  emStrongRDelimAst: emStrongRDelimAstGfm,
  emStrongLDelim: emStrongLDelimGfm,
  url: edit(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/, "i").replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),
  _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
  del: /^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,
  text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
};
var inlineBreaks = {
  ...inlineGfm,
  br: edit(br).replace("{2,}", "*").getRegex(),
  text: edit(inlineGfm.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
};
var block = {
  normal: blockNormal,
  gfm: blockGfm,
  pedantic: blockPedantic
};
var inline = {
  normal: inlineNormal,
  gfm: inlineGfm,
  breaks: inlineBreaks,
  pedantic: inlinePedantic
};
var escapeReplacements = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};
var getEscapeReplacement = (ch) => escapeReplacements[ch];
function escape(html2, encode) {
  if (encode) {
    if (other.escapeTest.test(html2)) {
      return html2.replace(other.escapeReplace, getEscapeReplacement);
    }
  } else {
    if (other.escapeTestNoEncode.test(html2)) {
      return html2.replace(other.escapeReplaceNoEncode, getEscapeReplacement);
    }
  }
  return html2;
}
function cleanUrl(href) {
  try {
    href = encodeURI(href).replace(other.percentDecode, "%");
  } catch {
    return null;
  }
  return href;
}
function splitCells(tableRow, count) {
  var _a2;
  const row = tableRow.replace(other.findPipe, (match, offset, str) => {
    let escaped = false;
    let curr = offset;
    while (--curr >= 0 && str[curr] === "\\")
      escaped = !escaped;
    if (escaped) {
      return "|";
    } else {
      return " |";
    }
  }), cells = row.split(other.splitPipe);
  let i = 0;
  if (!cells[0].trim()) {
    cells.shift();
  }
  if (cells.length > 0 && !((_a2 = cells.at(-1)) == null ? void 0 : _a2.trim())) {
    cells.pop();
  }
  if (count) {
    if (cells.length > count) {
      cells.splice(count);
    } else {
      while (cells.length < count)
        cells.push("");
    }
  }
  for (; i < cells.length; i++) {
    cells[i] = cells[i].trim().replace(other.slashPipe, "|");
  }
  return cells;
}
function rtrim(str, c2, invert) {
  const l = str.length;
  if (l === 0) {
    return "";
  }
  let suffLen = 0;
  while (suffLen < l) {
    const currChar = str.charAt(l - suffLen - 1);
    if (currChar === c2 && true) {
      suffLen++;
    } else {
      break;
    }
  }
  return str.slice(0, l - suffLen);
}
function findClosingBracket(str, b) {
  if (str.indexOf(b[1]) === -1) {
    return -1;
  }
  let level = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === "\\") {
      i++;
    } else if (str[i] === b[0]) {
      level++;
    } else if (str[i] === b[1]) {
      level--;
      if (level < 0) {
        return i;
      }
    }
  }
  return -1;
}
function outputLink(cap, link2, raw, lexer2, rules) {
  const href = link2.href;
  const title = link2.title || null;
  const text = cap[1].replace(rules.other.outputLinkReplace, "$1");
  if (cap[0].charAt(0) !== "!") {
    lexer2.state.inLink = true;
    const token = {
      type: "link",
      raw,
      href,
      title,
      text,
      tokens: lexer2.inlineTokens(text)
    };
    lexer2.state.inLink = false;
    return token;
  }
  return {
    type: "image",
    raw,
    href,
    title,
    text
  };
}
function indentCodeCompensation(raw, text, rules) {
  const matchIndentToCode = raw.match(rules.other.indentCodeCompensation);
  if (matchIndentToCode === null) {
    return text;
  }
  const indentToCode = matchIndentToCode[1];
  return text.split("\n").map((node) => {
    const matchIndentInNode = node.match(rules.other.beginningSpace);
    if (matchIndentInNode === null) {
      return node;
    }
    const [indentInNode] = matchIndentInNode;
    if (indentInNode.length >= indentToCode.length) {
      return node.slice(indentToCode.length);
    }
    return node;
  }).join("\n");
}
var _Tokenizer = class {
  // set by the lexer
  constructor(options2) {
    __publicField(this, "options");
    __publicField(this, "rules");
    // set by the lexer
    __publicField(this, "lexer");
    this.options = options2 || _defaults;
  }
  space(src) {
    const cap = this.rules.block.newline.exec(src);
    if (cap && cap[0].length > 0) {
      return {
        type: "space",
        raw: cap[0]
      };
    }
  }
  code(src) {
    const cap = this.rules.block.code.exec(src);
    if (cap) {
      const text = cap[0].replace(this.rules.other.codeRemoveIndent, "");
      return {
        type: "code",
        raw: cap[0],
        codeBlockStyle: "indented",
        text: !this.options.pedantic ? rtrim(text, "\n") : text
      };
    }
  }
  fences(src) {
    const cap = this.rules.block.fences.exec(src);
    if (cap) {
      const raw = cap[0];
      const text = indentCodeCompensation(raw, cap[3] || "", this.rules);
      return {
        type: "code",
        raw,
        lang: cap[2] ? cap[2].trim().replace(this.rules.inline.anyPunctuation, "$1") : cap[2],
        text
      };
    }
  }
  heading(src) {
    const cap = this.rules.block.heading.exec(src);
    if (cap) {
      let text = cap[2].trim();
      if (this.rules.other.endingHash.test(text)) {
        const trimmed = rtrim(text, "#");
        if (this.options.pedantic) {
          text = trimmed.trim();
        } else if (!trimmed || this.rules.other.endingSpaceChar.test(trimmed)) {
          text = trimmed.trim();
        }
      }
      return {
        type: "heading",
        raw: cap[0],
        depth: cap[1].length,
        text,
        tokens: this.lexer.inline(text)
      };
    }
  }
  hr(src) {
    const cap = this.rules.block.hr.exec(src);
    if (cap) {
      return {
        type: "hr",
        raw: rtrim(cap[0], "\n")
      };
    }
  }
  blockquote(src) {
    const cap = this.rules.block.blockquote.exec(src);
    if (cap) {
      let lines = rtrim(cap[0], "\n").split("\n");
      let raw = "";
      let text = "";
      const tokens = [];
      while (lines.length > 0) {
        let inBlockquote = false;
        const currentLines = [];
        let i;
        for (i = 0; i < lines.length; i++) {
          if (this.rules.other.blockquoteStart.test(lines[i])) {
            currentLines.push(lines[i]);
            inBlockquote = true;
          } else if (!inBlockquote) {
            currentLines.push(lines[i]);
          } else {
            break;
          }
        }
        lines = lines.slice(i);
        const currentRaw = currentLines.join("\n");
        const currentText = currentRaw.replace(this.rules.other.blockquoteSetextReplace, "\n    $1").replace(this.rules.other.blockquoteSetextReplace2, "");
        raw = raw ? `${raw}
${currentRaw}` : currentRaw;
        text = text ? `${text}
${currentText}` : currentText;
        const top = this.lexer.state.top;
        this.lexer.state.top = true;
        this.lexer.blockTokens(currentText, tokens, true);
        this.lexer.state.top = top;
        if (lines.length === 0) {
          break;
        }
        const lastToken = tokens.at(-1);
        if ((lastToken == null ? void 0 : lastToken.type) === "code") {
          break;
        } else if ((lastToken == null ? void 0 : lastToken.type) === "blockquote") {
          const oldToken = lastToken;
          const newText = oldToken.raw + "\n" + lines.join("\n");
          const newToken = this.blockquote(newText);
          tokens[tokens.length - 1] = newToken;
          raw = raw.substring(0, raw.length - oldToken.raw.length) + newToken.raw;
          text = text.substring(0, text.length - oldToken.text.length) + newToken.text;
          break;
        } else if ((lastToken == null ? void 0 : lastToken.type) === "list") {
          const oldToken = lastToken;
          const newText = oldToken.raw + "\n" + lines.join("\n");
          const newToken = this.list(newText);
          tokens[tokens.length - 1] = newToken;
          raw = raw.substring(0, raw.length - lastToken.raw.length) + newToken.raw;
          text = text.substring(0, text.length - oldToken.raw.length) + newToken.raw;
          lines = newText.substring(tokens.at(-1).raw.length).split("\n");
          continue;
        }
      }
      return {
        type: "blockquote",
        raw,
        tokens,
        text
      };
    }
  }
  list(src) {
    let cap = this.rules.block.list.exec(src);
    if (cap) {
      let bull = cap[1].trim();
      const isordered = bull.length > 1;
      const list2 = {
        type: "list",
        raw: "",
        ordered: isordered,
        start: isordered ? +bull.slice(0, -1) : "",
        loose: false,
        items: []
      };
      bull = isordered ? `\\d{1,9}\\${bull.slice(-1)}` : `\\${bull}`;
      if (this.options.pedantic) {
        bull = isordered ? bull : "[*+-]";
      }
      const itemRegex = this.rules.other.listItemRegex(bull);
      let endsWithBlankLine = false;
      while (src) {
        let endEarly = false;
        let raw = "";
        let itemContents = "";
        if (!(cap = itemRegex.exec(src))) {
          break;
        }
        if (this.rules.block.hr.test(src)) {
          break;
        }
        raw = cap[0];
        src = src.substring(raw.length);
        let line = cap[2].split("\n", 1)[0].replace(this.rules.other.listReplaceTabs, (t2) => " ".repeat(3 * t2.length));
        let nextLine = src.split("\n", 1)[0];
        let blankLine = !line.trim();
        let indent = 0;
        if (this.options.pedantic) {
          indent = 2;
          itemContents = line.trimStart();
        } else if (blankLine) {
          indent = cap[1].length + 1;
        } else {
          indent = cap[2].search(this.rules.other.nonSpaceChar);
          indent = indent > 4 ? 1 : indent;
          itemContents = line.slice(indent);
          indent += cap[1].length;
        }
        if (blankLine && this.rules.other.blankLine.test(nextLine)) {
          raw += nextLine + "\n";
          src = src.substring(nextLine.length + 1);
          endEarly = true;
        }
        if (!endEarly) {
          const nextBulletRegex = this.rules.other.nextBulletRegex(indent);
          const hrRegex = this.rules.other.hrRegex(indent);
          const fencesBeginRegex = this.rules.other.fencesBeginRegex(indent);
          const headingBeginRegex = this.rules.other.headingBeginRegex(indent);
          const htmlBeginRegex = this.rules.other.htmlBeginRegex(indent);
          while (src) {
            const rawLine = src.split("\n", 1)[0];
            let nextLineWithoutTabs;
            nextLine = rawLine;
            if (this.options.pedantic) {
              nextLine = nextLine.replace(this.rules.other.listReplaceNesting, "  ");
              nextLineWithoutTabs = nextLine;
            } else {
              nextLineWithoutTabs = nextLine.replace(this.rules.other.tabCharGlobal, "    ");
            }
            if (fencesBeginRegex.test(nextLine)) {
              break;
            }
            if (headingBeginRegex.test(nextLine)) {
              break;
            }
            if (htmlBeginRegex.test(nextLine)) {
              break;
            }
            if (nextBulletRegex.test(nextLine)) {
              break;
            }
            if (hrRegex.test(nextLine)) {
              break;
            }
            if (nextLineWithoutTabs.search(this.rules.other.nonSpaceChar) >= indent || !nextLine.trim()) {
              itemContents += "\n" + nextLineWithoutTabs.slice(indent);
            } else {
              if (blankLine) {
                break;
              }
              if (line.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4) {
                break;
              }
              if (fencesBeginRegex.test(line)) {
                break;
              }
              if (headingBeginRegex.test(line)) {
                break;
              }
              if (hrRegex.test(line)) {
                break;
              }
              itemContents += "\n" + nextLine;
            }
            if (!blankLine && !nextLine.trim()) {
              blankLine = true;
            }
            raw += rawLine + "\n";
            src = src.substring(rawLine.length + 1);
            line = nextLineWithoutTabs.slice(indent);
          }
        }
        if (!list2.loose) {
          if (endsWithBlankLine) {
            list2.loose = true;
          } else if (this.rules.other.doubleBlankLine.test(raw)) {
            endsWithBlankLine = true;
          }
        }
        let istask = null;
        let ischecked;
        if (this.options.gfm) {
          istask = this.rules.other.listIsTask.exec(itemContents);
          if (istask) {
            ischecked = istask[0] !== "[ ] ";
            itemContents = itemContents.replace(this.rules.other.listReplaceTask, "");
          }
        }
        list2.items.push({
          type: "list_item",
          raw,
          task: !!istask,
          checked: ischecked,
          loose: false,
          text: itemContents,
          tokens: []
        });
        list2.raw += raw;
      }
      const lastItem = list2.items.at(-1);
      if (lastItem) {
        lastItem.raw = lastItem.raw.trimEnd();
        lastItem.text = lastItem.text.trimEnd();
      } else {
        return;
      }
      list2.raw = list2.raw.trimEnd();
      for (let i = 0; i < list2.items.length; i++) {
        this.lexer.state.top = false;
        list2.items[i].tokens = this.lexer.blockTokens(list2.items[i].text, []);
        if (!list2.loose) {
          const spacers = list2.items[i].tokens.filter((t2) => t2.type === "space");
          const hasMultipleLineBreaks = spacers.length > 0 && spacers.some((t2) => this.rules.other.anyLine.test(t2.raw));
          list2.loose = hasMultipleLineBreaks;
        }
      }
      if (list2.loose) {
        for (let i = 0; i < list2.items.length; i++) {
          list2.items[i].loose = true;
        }
      }
      return list2;
    }
  }
  html(src) {
    const cap = this.rules.block.html.exec(src);
    if (cap) {
      const token = {
        type: "html",
        block: true,
        raw: cap[0],
        pre: cap[1] === "pre" || cap[1] === "script" || cap[1] === "style",
        text: cap[0]
      };
      return token;
    }
  }
  def(src) {
    const cap = this.rules.block.def.exec(src);
    if (cap) {
      const tag2 = cap[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal, " ");
      const href = cap[2] ? cap[2].replace(this.rules.other.hrefBrackets, "$1").replace(this.rules.inline.anyPunctuation, "$1") : "";
      const title = cap[3] ? cap[3].substring(1, cap[3].length - 1).replace(this.rules.inline.anyPunctuation, "$1") : cap[3];
      return {
        type: "def",
        tag: tag2,
        raw: cap[0],
        href,
        title
      };
    }
  }
  table(src) {
    var _a2;
    const cap = this.rules.block.table.exec(src);
    if (!cap) {
      return;
    }
    if (!this.rules.other.tableDelimiter.test(cap[2])) {
      return;
    }
    const headers = splitCells(cap[1]);
    const aligns = cap[2].replace(this.rules.other.tableAlignChars, "").split("|");
    const rows = ((_a2 = cap[3]) == null ? void 0 : _a2.trim()) ? cap[3].replace(this.rules.other.tableRowBlankLine, "").split("\n") : [];
    const item = {
      type: "table",
      raw: cap[0],
      header: [],
      align: [],
      rows: []
    };
    if (headers.length !== aligns.length) {
      return;
    }
    for (const align of aligns) {
      if (this.rules.other.tableAlignRight.test(align)) {
        item.align.push("right");
      } else if (this.rules.other.tableAlignCenter.test(align)) {
        item.align.push("center");
      } else if (this.rules.other.tableAlignLeft.test(align)) {
        item.align.push("left");
      } else {
        item.align.push(null);
      }
    }
    for (let i = 0; i < headers.length; i++) {
      item.header.push({
        text: headers[i],
        tokens: this.lexer.inline(headers[i]),
        header: true,
        align: item.align[i]
      });
    }
    for (const row of rows) {
      item.rows.push(splitCells(row, item.header.length).map((cell, i) => {
        return {
          text: cell,
          tokens: this.lexer.inline(cell),
          header: false,
          align: item.align[i]
        };
      }));
    }
    return item;
  }
  lheading(src) {
    const cap = this.rules.block.lheading.exec(src);
    if (cap) {
      return {
        type: "heading",
        raw: cap[0],
        depth: cap[2].charAt(0) === "=" ? 1 : 2,
        text: cap[1],
        tokens: this.lexer.inline(cap[1])
      };
    }
  }
  paragraph(src) {
    const cap = this.rules.block.paragraph.exec(src);
    if (cap) {
      const text = cap[1].charAt(cap[1].length - 1) === "\n" ? cap[1].slice(0, -1) : cap[1];
      return {
        type: "paragraph",
        raw: cap[0],
        text,
        tokens: this.lexer.inline(text)
      };
    }
  }
  text(src) {
    const cap = this.rules.block.text.exec(src);
    if (cap) {
      return {
        type: "text",
        raw: cap[0],
        text: cap[0],
        tokens: this.lexer.inline(cap[0])
      };
    }
  }
  escape(src) {
    const cap = this.rules.inline.escape.exec(src);
    if (cap) {
      return {
        type: "escape",
        raw: cap[0],
        text: cap[1]
      };
    }
  }
  tag(src) {
    const cap = this.rules.inline.tag.exec(src);
    if (cap) {
      if (!this.lexer.state.inLink && this.rules.other.startATag.test(cap[0])) {
        this.lexer.state.inLink = true;
      } else if (this.lexer.state.inLink && this.rules.other.endATag.test(cap[0])) {
        this.lexer.state.inLink = false;
      }
      if (!this.lexer.state.inRawBlock && this.rules.other.startPreScriptTag.test(cap[0])) {
        this.lexer.state.inRawBlock = true;
      } else if (this.lexer.state.inRawBlock && this.rules.other.endPreScriptTag.test(cap[0])) {
        this.lexer.state.inRawBlock = false;
      }
      return {
        type: "html",
        raw: cap[0],
        inLink: this.lexer.state.inLink,
        inRawBlock: this.lexer.state.inRawBlock,
        block: false,
        text: cap[0]
      };
    }
  }
  link(src) {
    const cap = this.rules.inline.link.exec(src);
    if (cap) {
      const trimmedUrl = cap[2].trim();
      if (!this.options.pedantic && this.rules.other.startAngleBracket.test(trimmedUrl)) {
        if (!this.rules.other.endAngleBracket.test(trimmedUrl)) {
          return;
        }
        const rtrimSlash = rtrim(trimmedUrl.slice(0, -1), "\\");
        if ((trimmedUrl.length - rtrimSlash.length) % 2 === 0) {
          return;
        }
      } else {
        const lastParenIndex = findClosingBracket(cap[2], "()");
        if (lastParenIndex > -1) {
          const start = cap[0].indexOf("!") === 0 ? 5 : 4;
          const linkLen = start + cap[1].length + lastParenIndex;
          cap[2] = cap[2].substring(0, lastParenIndex);
          cap[0] = cap[0].substring(0, linkLen).trim();
          cap[3] = "";
        }
      }
      let href = cap[2];
      let title = "";
      if (this.options.pedantic) {
        const link2 = this.rules.other.pedanticHrefTitle.exec(href);
        if (link2) {
          href = link2[1];
          title = link2[3];
        }
      } else {
        title = cap[3] ? cap[3].slice(1, -1) : "";
      }
      href = href.trim();
      if (this.rules.other.startAngleBracket.test(href)) {
        if (this.options.pedantic && !this.rules.other.endAngleBracket.test(trimmedUrl)) {
          href = href.slice(1);
        } else {
          href = href.slice(1, -1);
        }
      }
      return outputLink(cap, {
        href: href ? href.replace(this.rules.inline.anyPunctuation, "$1") : href,
        title: title ? title.replace(this.rules.inline.anyPunctuation, "$1") : title
      }, cap[0], this.lexer, this.rules);
    }
  }
  reflink(src, links) {
    let cap;
    if ((cap = this.rules.inline.reflink.exec(src)) || (cap = this.rules.inline.nolink.exec(src))) {
      const linkString = (cap[2] || cap[1]).replace(this.rules.other.multipleSpaceGlobal, " ");
      const link2 = links[linkString.toLowerCase()];
      if (!link2) {
        const text = cap[0].charAt(0);
        return {
          type: "text",
          raw: text,
          text
        };
      }
      return outputLink(cap, link2, cap[0], this.lexer, this.rules);
    }
  }
  emStrong(src, maskedSrc, prevChar = "") {
    let match = this.rules.inline.emStrongLDelim.exec(src);
    if (!match)
      return;
    if (match[3] && prevChar.match(this.rules.other.unicodeAlphaNumeric))
      return;
    const nextChar = match[1] || match[2] || "";
    if (!nextChar || !prevChar || this.rules.inline.punctuation.exec(prevChar)) {
      const lLength = [...match[0]].length - 1;
      let rDelim, rLength, delimTotal = lLength, midDelimTotal = 0;
      const endReg = match[0][0] === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
      endReg.lastIndex = 0;
      maskedSrc = maskedSrc.slice(-1 * src.length + lLength);
      while ((match = endReg.exec(maskedSrc)) != null) {
        rDelim = match[1] || match[2] || match[3] || match[4] || match[5] || match[6];
        if (!rDelim)
          continue;
        rLength = [...rDelim].length;
        if (match[3] || match[4]) {
          delimTotal += rLength;
          continue;
        } else if (match[5] || match[6]) {
          if (lLength % 3 && !((lLength + rLength) % 3)) {
            midDelimTotal += rLength;
            continue;
          }
        }
        delimTotal -= rLength;
        if (delimTotal > 0)
          continue;
        rLength = Math.min(rLength, rLength + delimTotal + midDelimTotal);
        const lastCharLength = [...match[0]][0].length;
        const raw = src.slice(0, lLength + match.index + lastCharLength + rLength);
        if (Math.min(lLength, rLength) % 2) {
          const text2 = raw.slice(1, -1);
          return {
            type: "em",
            raw,
            text: text2,
            tokens: this.lexer.inlineTokens(text2)
          };
        }
        const text = raw.slice(2, -2);
        return {
          type: "strong",
          raw,
          text,
          tokens: this.lexer.inlineTokens(text)
        };
      }
    }
  }
  codespan(src) {
    const cap = this.rules.inline.code.exec(src);
    if (cap) {
      let text = cap[2].replace(this.rules.other.newLineCharGlobal, " ");
      const hasNonSpaceChars = this.rules.other.nonSpaceChar.test(text);
      const hasSpaceCharsOnBothEnds = this.rules.other.startingSpaceChar.test(text) && this.rules.other.endingSpaceChar.test(text);
      if (hasNonSpaceChars && hasSpaceCharsOnBothEnds) {
        text = text.substring(1, text.length - 1);
      }
      return {
        type: "codespan",
        raw: cap[0],
        text
      };
    }
  }
  br(src) {
    const cap = this.rules.inline.br.exec(src);
    if (cap) {
      return {
        type: "br",
        raw: cap[0]
      };
    }
  }
  del(src) {
    const cap = this.rules.inline.del.exec(src);
    if (cap) {
      return {
        type: "del",
        raw: cap[0],
        text: cap[2],
        tokens: this.lexer.inlineTokens(cap[2])
      };
    }
  }
  autolink(src) {
    const cap = this.rules.inline.autolink.exec(src);
    if (cap) {
      let text, href;
      if (cap[2] === "@") {
        text = cap[1];
        href = "mailto:" + text;
      } else {
        text = cap[1];
        href = text;
      }
      return {
        type: "link",
        raw: cap[0],
        text,
        href,
        tokens: [
          {
            type: "text",
            raw: text,
            text
          }
        ]
      };
    }
  }
  url(src) {
    var _a2;
    let cap;
    if (cap = this.rules.inline.url.exec(src)) {
      let text, href;
      if (cap[2] === "@") {
        text = cap[0];
        href = "mailto:" + text;
      } else {
        let prevCapZero;
        do {
          prevCapZero = cap[0];
          cap[0] = ((_a2 = this.rules.inline._backpedal.exec(cap[0])) == null ? void 0 : _a2[0]) ?? "";
        } while (prevCapZero !== cap[0]);
        text = cap[0];
        if (cap[1] === "www.") {
          href = "http://" + cap[0];
        } else {
          href = cap[0];
        }
      }
      return {
        type: "link",
        raw: cap[0],
        text,
        href,
        tokens: [
          {
            type: "text",
            raw: text,
            text
          }
        ]
      };
    }
  }
  inlineText(src) {
    const cap = this.rules.inline.text.exec(src);
    if (cap) {
      const escaped = this.lexer.state.inRawBlock;
      return {
        type: "text",
        raw: cap[0],
        text: cap[0],
        escaped
      };
    }
  }
};
var _Lexer = class __Lexer {
  constructor(options2) {
    __publicField(this, "tokens");
    __publicField(this, "options");
    __publicField(this, "state");
    __publicField(this, "tokenizer");
    __publicField(this, "inlineQueue");
    this.tokens = [];
    this.tokens.links = /* @__PURE__ */ Object.create(null);
    this.options = options2 || _defaults;
    this.options.tokenizer = this.options.tokenizer || new _Tokenizer();
    this.tokenizer = this.options.tokenizer;
    this.tokenizer.options = this.options;
    this.tokenizer.lexer = this;
    this.inlineQueue = [];
    this.state = {
      inLink: false,
      inRawBlock: false,
      top: true
    };
    const rules = {
      other,
      block: block.normal,
      inline: inline.normal
    };
    if (this.options.pedantic) {
      rules.block = block.pedantic;
      rules.inline = inline.pedantic;
    } else if (this.options.gfm) {
      rules.block = block.gfm;
      if (this.options.breaks) {
        rules.inline = inline.breaks;
      } else {
        rules.inline = inline.gfm;
      }
    }
    this.tokenizer.rules = rules;
  }
  /**
   * Expose Rules
   */
  static get rules() {
    return {
      block,
      inline
    };
  }
  /**
   * Static Lex Method
   */
  static lex(src, options2) {
    const lexer2 = new __Lexer(options2);
    return lexer2.lex(src);
  }
  /**
   * Static Lex Inline Method
   */
  static lexInline(src, options2) {
    const lexer2 = new __Lexer(options2);
    return lexer2.inlineTokens(src);
  }
  /**
   * Preprocessing
   */
  lex(src) {
    src = src.replace(other.carriageReturn, "\n");
    this.blockTokens(src, this.tokens);
    for (let i = 0; i < this.inlineQueue.length; i++) {
      const next = this.inlineQueue[i];
      this.inlineTokens(next.src, next.tokens);
    }
    this.inlineQueue = [];
    return this.tokens;
  }
  blockTokens(src, tokens = [], lastParagraphClipped = false) {
    var _a2, _b, _c;
    if (this.options.pedantic) {
      src = src.replace(other.tabCharGlobal, "    ").replace(other.spaceLine, "");
    }
    while (src) {
      let token;
      if ((_b = (_a2 = this.options.extensions) == null ? void 0 : _a2.block) == null ? void 0 : _b.some((extTokenizer) => {
        if (token = extTokenizer.call({ lexer: this }, src, tokens)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          return true;
        }
        return false;
      })) {
        continue;
      }
      if (token = this.tokenizer.space(src)) {
        src = src.substring(token.raw.length);
        const lastToken = tokens.at(-1);
        if (token.raw.length === 1 && lastToken !== void 0) {
          lastToken.raw += "\n";
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (token = this.tokenizer.code(src)) {
        src = src.substring(token.raw.length);
        const lastToken = tokens.at(-1);
        if ((lastToken == null ? void 0 : lastToken.type) === "paragraph" || (lastToken == null ? void 0 : lastToken.type) === "text") {
          lastToken.raw += "\n" + token.raw;
          lastToken.text += "\n" + token.text;
          this.inlineQueue.at(-1).src = lastToken.text;
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (token = this.tokenizer.fences(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.heading(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.hr(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.blockquote(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.list(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.html(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.def(src)) {
        src = src.substring(token.raw.length);
        const lastToken = tokens.at(-1);
        if ((lastToken == null ? void 0 : lastToken.type) === "paragraph" || (lastToken == null ? void 0 : lastToken.type) === "text") {
          lastToken.raw += "\n" + token.raw;
          lastToken.text += "\n" + token.raw;
          this.inlineQueue.at(-1).src = lastToken.text;
        } else if (!this.tokens.links[token.tag]) {
          this.tokens.links[token.tag] = {
            href: token.href,
            title: token.title
          };
        }
        continue;
      }
      if (token = this.tokenizer.table(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.lheading(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      let cutSrc = src;
      if ((_c = this.options.extensions) == null ? void 0 : _c.startBlock) {
        let startIndex = Infinity;
        const tempSrc = src.slice(1);
        let tempStart;
        this.options.extensions.startBlock.forEach((getStartIndex) => {
          tempStart = getStartIndex.call({ lexer: this }, tempSrc);
          if (typeof tempStart === "number" && tempStart >= 0) {
            startIndex = Math.min(startIndex, tempStart);
          }
        });
        if (startIndex < Infinity && startIndex >= 0) {
          cutSrc = src.substring(0, startIndex + 1);
        }
      }
      if (this.state.top && (token = this.tokenizer.paragraph(cutSrc))) {
        const lastToken = tokens.at(-1);
        if (lastParagraphClipped && (lastToken == null ? void 0 : lastToken.type) === "paragraph") {
          lastToken.raw += "\n" + token.raw;
          lastToken.text += "\n" + token.text;
          this.inlineQueue.pop();
          this.inlineQueue.at(-1).src = lastToken.text;
        } else {
          tokens.push(token);
        }
        lastParagraphClipped = cutSrc.length !== src.length;
        src = src.substring(token.raw.length);
        continue;
      }
      if (token = this.tokenizer.text(src)) {
        src = src.substring(token.raw.length);
        const lastToken = tokens.at(-1);
        if ((lastToken == null ? void 0 : lastToken.type) === "text") {
          lastToken.raw += "\n" + token.raw;
          lastToken.text += "\n" + token.text;
          this.inlineQueue.pop();
          this.inlineQueue.at(-1).src = lastToken.text;
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (src) {
        const errMsg = "Infinite loop on byte: " + src.charCodeAt(0);
        if (this.options.silent) {
          console.error(errMsg);
          break;
        } else {
          throw new Error(errMsg);
        }
      }
    }
    this.state.top = true;
    return tokens;
  }
  inline(src, tokens = []) {
    this.inlineQueue.push({ src, tokens });
    return tokens;
  }
  /**
   * Lexing/Compiling
   */
  inlineTokens(src, tokens = []) {
    var _a2, _b, _c;
    let maskedSrc = src;
    let match = null;
    if (this.tokens.links) {
      const links = Object.keys(this.tokens.links);
      if (links.length > 0) {
        while ((match = this.tokenizer.rules.inline.reflinkSearch.exec(maskedSrc)) != null) {
          if (links.includes(match[0].slice(match[0].lastIndexOf("[") + 1, -1))) {
            maskedSrc = maskedSrc.slice(0, match.index) + "[" + "a".repeat(match[0].length - 2) + "]" + maskedSrc.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex);
          }
        }
      }
    }
    while ((match = this.tokenizer.rules.inline.blockSkip.exec(maskedSrc)) != null) {
      maskedSrc = maskedSrc.slice(0, match.index) + "[" + "a".repeat(match[0].length - 2) + "]" + maskedSrc.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
    }
    while ((match = this.tokenizer.rules.inline.anyPunctuation.exec(maskedSrc)) != null) {
      maskedSrc = maskedSrc.slice(0, match.index) + "++" + maskedSrc.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);
    }
    let keepPrevChar = false;
    let prevChar = "";
    while (src) {
      if (!keepPrevChar) {
        prevChar = "";
      }
      keepPrevChar = false;
      let token;
      if ((_b = (_a2 = this.options.extensions) == null ? void 0 : _a2.inline) == null ? void 0 : _b.some((extTokenizer) => {
        if (token = extTokenizer.call({ lexer: this }, src, tokens)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          return true;
        }
        return false;
      })) {
        continue;
      }
      if (token = this.tokenizer.escape(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.tag(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.link(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.reflink(src, this.tokens.links)) {
        src = src.substring(token.raw.length);
        const lastToken = tokens.at(-1);
        if (token.type === "text" && (lastToken == null ? void 0 : lastToken.type) === "text") {
          lastToken.raw += token.raw;
          lastToken.text += token.text;
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (token = this.tokenizer.emStrong(src, maskedSrc, prevChar)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.codespan(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.br(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.del(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.autolink(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (!this.state.inLink && (token = this.tokenizer.url(src))) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      let cutSrc = src;
      if ((_c = this.options.extensions) == null ? void 0 : _c.startInline) {
        let startIndex = Infinity;
        const tempSrc = src.slice(1);
        let tempStart;
        this.options.extensions.startInline.forEach((getStartIndex) => {
          tempStart = getStartIndex.call({ lexer: this }, tempSrc);
          if (typeof tempStart === "number" && tempStart >= 0) {
            startIndex = Math.min(startIndex, tempStart);
          }
        });
        if (startIndex < Infinity && startIndex >= 0) {
          cutSrc = src.substring(0, startIndex + 1);
        }
      }
      if (token = this.tokenizer.inlineText(cutSrc)) {
        src = src.substring(token.raw.length);
        if (token.raw.slice(-1) !== "_") {
          prevChar = token.raw.slice(-1);
        }
        keepPrevChar = true;
        const lastToken = tokens.at(-1);
        if ((lastToken == null ? void 0 : lastToken.type) === "text") {
          lastToken.raw += token.raw;
          lastToken.text += token.text;
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (src) {
        const errMsg = "Infinite loop on byte: " + src.charCodeAt(0);
        if (this.options.silent) {
          console.error(errMsg);
          break;
        } else {
          throw new Error(errMsg);
        }
      }
    }
    return tokens;
  }
};
var _Renderer = class {
  // set by the parser
  constructor(options2) {
    __publicField(this, "options");
    __publicField(this, "parser");
    this.options = options2 || _defaults;
  }
  space(token) {
    return "";
  }
  code({ text, lang, escaped }) {
    var _a2;
    const langString = (_a2 = (lang || "").match(other.notSpaceStart)) == null ? void 0 : _a2[0];
    const code = text.replace(other.endingNewline, "") + "\n";
    if (!langString) {
      return "<pre><code>" + (escaped ? code : escape(code, true)) + "</code></pre>\n";
    }
    return '<pre><code class="language-' + escape(langString) + '">' + (escaped ? code : escape(code, true)) + "</code></pre>\n";
  }
  blockquote({ tokens }) {
    const body = this.parser.parse(tokens);
    return `<blockquote>
${body}</blockquote>
`;
  }
  html({ text }) {
    return text;
  }
  heading({ tokens, depth }) {
    return `<h${depth}>${this.parser.parseInline(tokens)}</h${depth}>
`;
  }
  hr(token) {
    return "<hr>\n";
  }
  list(token) {
    const ordered = token.ordered;
    const start = token.start;
    let body = "";
    for (let j2 = 0; j2 < token.items.length; j2++) {
      const item = token.items[j2];
      body += this.listitem(item);
    }
    const type = ordered ? "ol" : "ul";
    const startAttr = ordered && start !== 1 ? ' start="' + start + '"' : "";
    return "<" + type + startAttr + ">\n" + body + "</" + type + ">\n";
  }
  listitem(item) {
    var _a2;
    let itemBody = "";
    if (item.task) {
      const checkbox = this.checkbox({ checked: !!item.checked });
      if (item.loose) {
        if (((_a2 = item.tokens[0]) == null ? void 0 : _a2.type) === "paragraph") {
          item.tokens[0].text = checkbox + " " + item.tokens[0].text;
          if (item.tokens[0].tokens && item.tokens[0].tokens.length > 0 && item.tokens[0].tokens[0].type === "text") {
            item.tokens[0].tokens[0].text = checkbox + " " + escape(item.tokens[0].tokens[0].text);
            item.tokens[0].tokens[0].escaped = true;
          }
        } else {
          item.tokens.unshift({
            type: "text",
            raw: checkbox + " ",
            text: checkbox + " ",
            escaped: true
          });
        }
      } else {
        itemBody += checkbox + " ";
      }
    }
    itemBody += this.parser.parse(item.tokens, !!item.loose);
    return `<li>${itemBody}</li>
`;
  }
  checkbox({ checked }) {
    return "<input " + (checked ? 'checked="" ' : "") + 'disabled="" type="checkbox">';
  }
  paragraph({ tokens }) {
    return `<p>${this.parser.parseInline(tokens)}</p>
`;
  }
  table(token) {
    let header = "";
    let cell = "";
    for (let j2 = 0; j2 < token.header.length; j2++) {
      cell += this.tablecell(token.header[j2]);
    }
    header += this.tablerow({ text: cell });
    let body = "";
    for (let j2 = 0; j2 < token.rows.length; j2++) {
      const row = token.rows[j2];
      cell = "";
      for (let k = 0; k < row.length; k++) {
        cell += this.tablecell(row[k]);
      }
      body += this.tablerow({ text: cell });
    }
    if (body)
      body = `<tbody>${body}</tbody>`;
    return "<table>\n<thead>\n" + header + "</thead>\n" + body + "</table>\n";
  }
  tablerow({ text }) {
    return `<tr>
${text}</tr>
`;
  }
  tablecell(token) {
    const content = this.parser.parseInline(token.tokens);
    const type = token.header ? "th" : "td";
    const tag2 = token.align ? `<${type} align="${token.align}">` : `<${type}>`;
    return tag2 + content + `</${type}>
`;
  }
  /**
   * span level renderer
   */
  strong({ tokens }) {
    return `<strong>${this.parser.parseInline(tokens)}</strong>`;
  }
  em({ tokens }) {
    return `<em>${this.parser.parseInline(tokens)}</em>`;
  }
  codespan({ text }) {
    return `<code>${escape(text, true)}</code>`;
  }
  br(token) {
    return "<br>";
  }
  del({ tokens }) {
    return `<del>${this.parser.parseInline(tokens)}</del>`;
  }
  link({ href, title, tokens }) {
    const text = this.parser.parseInline(tokens);
    const cleanHref = cleanUrl(href);
    if (cleanHref === null) {
      return text;
    }
    href = cleanHref;
    let out = '<a href="' + href + '"';
    if (title) {
      out += ' title="' + escape(title) + '"';
    }
    out += ">" + text + "</a>";
    return out;
  }
  image({ href, title, text }) {
    const cleanHref = cleanUrl(href);
    if (cleanHref === null) {
      return escape(text);
    }
    href = cleanHref;
    let out = `<img src="${href}" alt="${text}"`;
    if (title) {
      out += ` title="${escape(title)}"`;
    }
    out += ">";
    return out;
  }
  text(token) {
    return "tokens" in token && token.tokens ? this.parser.parseInline(token.tokens) : "escaped" in token && token.escaped ? token.text : escape(token.text);
  }
};
var _TextRenderer = class {
  // no need for block level renderers
  strong({ text }) {
    return text;
  }
  em({ text }) {
    return text;
  }
  codespan({ text }) {
    return text;
  }
  del({ text }) {
    return text;
  }
  html({ text }) {
    return text;
  }
  text({ text }) {
    return text;
  }
  link({ text }) {
    return "" + text;
  }
  image({ text }) {
    return "" + text;
  }
  br() {
    return "";
  }
};
var _Parser = class __Parser {
  constructor(options2) {
    __publicField(this, "options");
    __publicField(this, "renderer");
    __publicField(this, "textRenderer");
    this.options = options2 || _defaults;
    this.options.renderer = this.options.renderer || new _Renderer();
    this.renderer = this.options.renderer;
    this.renderer.options = this.options;
    this.renderer.parser = this;
    this.textRenderer = new _TextRenderer();
  }
  /**
   * Static Parse Method
   */
  static parse(tokens, options2) {
    const parser2 = new __Parser(options2);
    return parser2.parse(tokens);
  }
  /**
   * Static Parse Inline Method
   */
  static parseInline(tokens, options2) {
    const parser2 = new __Parser(options2);
    return parser2.parseInline(tokens);
  }
  /**
   * Parse Loop
   */
  parse(tokens, top = true) {
    var _a2, _b;
    let out = "";
    for (let i = 0; i < tokens.length; i++) {
      const anyToken = tokens[i];
      if ((_b = (_a2 = this.options.extensions) == null ? void 0 : _a2.renderers) == null ? void 0 : _b[anyToken.type]) {
        const genericToken = anyToken;
        const ret = this.options.extensions.renderers[genericToken.type].call({ parser: this }, genericToken);
        if (ret !== false || !["space", "hr", "heading", "code", "table", "blockquote", "list", "html", "paragraph", "text"].includes(genericToken.type)) {
          out += ret || "";
          continue;
        }
      }
      const token = anyToken;
      switch (token.type) {
        case "space": {
          out += this.renderer.space(token);
          continue;
        }
        case "hr": {
          out += this.renderer.hr(token);
          continue;
        }
        case "heading": {
          out += this.renderer.heading(token);
          continue;
        }
        case "code": {
          out += this.renderer.code(token);
          continue;
        }
        case "table": {
          out += this.renderer.table(token);
          continue;
        }
        case "blockquote": {
          out += this.renderer.blockquote(token);
          continue;
        }
        case "list": {
          out += this.renderer.list(token);
          continue;
        }
        case "html": {
          out += this.renderer.html(token);
          continue;
        }
        case "paragraph": {
          out += this.renderer.paragraph(token);
          continue;
        }
        case "text": {
          let textToken = token;
          let body = this.renderer.text(textToken);
          while (i + 1 < tokens.length && tokens[i + 1].type === "text") {
            textToken = tokens[++i];
            body += "\n" + this.renderer.text(textToken);
          }
          if (top) {
            out += this.renderer.paragraph({
              type: "paragraph",
              raw: body,
              text: body,
              tokens: [{ type: "text", raw: body, text: body, escaped: true }]
            });
          } else {
            out += body;
          }
          continue;
        }
        default: {
          const errMsg = 'Token with "' + token.type + '" type was not found.';
          if (this.options.silent) {
            console.error(errMsg);
            return "";
          } else {
            throw new Error(errMsg);
          }
        }
      }
    }
    return out;
  }
  /**
   * Parse Inline Tokens
   */
  parseInline(tokens, renderer = this.renderer) {
    var _a2, _b;
    let out = "";
    for (let i = 0; i < tokens.length; i++) {
      const anyToken = tokens[i];
      if ((_b = (_a2 = this.options.extensions) == null ? void 0 : _a2.renderers) == null ? void 0 : _b[anyToken.type]) {
        const ret = this.options.extensions.renderers[anyToken.type].call({ parser: this }, anyToken);
        if (ret !== false || !["escape", "html", "link", "image", "strong", "em", "codespan", "br", "del", "text"].includes(anyToken.type)) {
          out += ret || "";
          continue;
        }
      }
      const token = anyToken;
      switch (token.type) {
        case "escape": {
          out += renderer.text(token);
          break;
        }
        case "html": {
          out += renderer.html(token);
          break;
        }
        case "link": {
          out += renderer.link(token);
          break;
        }
        case "image": {
          out += renderer.image(token);
          break;
        }
        case "strong": {
          out += renderer.strong(token);
          break;
        }
        case "em": {
          out += renderer.em(token);
          break;
        }
        case "codespan": {
          out += renderer.codespan(token);
          break;
        }
        case "br": {
          out += renderer.br(token);
          break;
        }
        case "del": {
          out += renderer.del(token);
          break;
        }
        case "text": {
          out += renderer.text(token);
          break;
        }
        default: {
          const errMsg = 'Token with "' + token.type + '" type was not found.';
          if (this.options.silent) {
            console.error(errMsg);
            return "";
          } else {
            throw new Error(errMsg);
          }
        }
      }
    }
    return out;
  }
};
var _Hooks = class {
  constructor(options2) {
    __publicField(this, "options");
    __publicField(this, "block");
    this.options = options2 || _defaults;
  }
  /**
   * Process markdown before marked
   */
  preprocess(markdown) {
    return markdown;
  }
  /**
   * Process HTML after marked is finished
   */
  postprocess(html2) {
    return html2;
  }
  /**
   * Process all tokens before walk tokens
   */
  processAllTokens(tokens) {
    return tokens;
  }
  /**
   * Provide function to tokenize markdown
   */
  provideLexer() {
    return this.block ? _Lexer.lex : _Lexer.lexInline;
  }
  /**
   * Provide function to parse tokens
   */
  provideParser() {
    return this.block ? _Parser.parse : _Parser.parseInline;
  }
};
__publicField(_Hooks, "passThroughHooks", /* @__PURE__ */ new Set([
  "preprocess",
  "postprocess",
  "processAllTokens"
]));
var Marked = class {
  constructor(...args) {
    __publicField(this, "defaults", _getDefaults());
    __publicField(this, "options", this.setOptions);
    __publicField(this, "parse", this.parseMarkdown(true));
    __publicField(this, "parseInline", this.parseMarkdown(false));
    __publicField(this, "Parser", _Parser);
    __publicField(this, "Renderer", _Renderer);
    __publicField(this, "TextRenderer", _TextRenderer);
    __publicField(this, "Lexer", _Lexer);
    __publicField(this, "Tokenizer", _Tokenizer);
    __publicField(this, "Hooks", _Hooks);
    this.use(...args);
  }
  /**
   * Run callback for every token
   */
  walkTokens(tokens, callback) {
    var _a2, _b;
    let values = [];
    for (const token of tokens) {
      values = values.concat(callback.call(this, token));
      switch (token.type) {
        case "table": {
          const tableToken = token;
          for (const cell of tableToken.header) {
            values = values.concat(this.walkTokens(cell.tokens, callback));
          }
          for (const row of tableToken.rows) {
            for (const cell of row) {
              values = values.concat(this.walkTokens(cell.tokens, callback));
            }
          }
          break;
        }
        case "list": {
          const listToken = token;
          values = values.concat(this.walkTokens(listToken.items, callback));
          break;
        }
        default: {
          const genericToken = token;
          if ((_b = (_a2 = this.defaults.extensions) == null ? void 0 : _a2.childTokens) == null ? void 0 : _b[genericToken.type]) {
            this.defaults.extensions.childTokens[genericToken.type].forEach((childTokens) => {
              const tokens2 = genericToken[childTokens].flat(Infinity);
              values = values.concat(this.walkTokens(tokens2, callback));
            });
          } else if (genericToken.tokens) {
            values = values.concat(this.walkTokens(genericToken.tokens, callback));
          }
        }
      }
    }
    return values;
  }
  use(...args) {
    const extensions = this.defaults.extensions || { renderers: {}, childTokens: {} };
    args.forEach((pack) => {
      const opts = { ...pack };
      opts.async = this.defaults.async || opts.async || false;
      if (pack.extensions) {
        pack.extensions.forEach((ext) => {
          if (!ext.name) {
            throw new Error("extension name required");
          }
          if ("renderer" in ext) {
            const prevRenderer = extensions.renderers[ext.name];
            if (prevRenderer) {
              extensions.renderers[ext.name] = function(...args2) {
                let ret = ext.renderer.apply(this, args2);
                if (ret === false) {
                  ret = prevRenderer.apply(this, args2);
                }
                return ret;
              };
            } else {
              extensions.renderers[ext.name] = ext.renderer;
            }
          }
          if ("tokenizer" in ext) {
            if (!ext.level || ext.level !== "block" && ext.level !== "inline") {
              throw new Error("extension level must be 'block' or 'inline'");
            }
            const extLevel = extensions[ext.level];
            if (extLevel) {
              extLevel.unshift(ext.tokenizer);
            } else {
              extensions[ext.level] = [ext.tokenizer];
            }
            if (ext.start) {
              if (ext.level === "block") {
                if (extensions.startBlock) {
                  extensions.startBlock.push(ext.start);
                } else {
                  extensions.startBlock = [ext.start];
                }
              } else if (ext.level === "inline") {
                if (extensions.startInline) {
                  extensions.startInline.push(ext.start);
                } else {
                  extensions.startInline = [ext.start];
                }
              }
            }
          }
          if ("childTokens" in ext && ext.childTokens) {
            extensions.childTokens[ext.name] = ext.childTokens;
          }
        });
        opts.extensions = extensions;
      }
      if (pack.renderer) {
        const renderer = this.defaults.renderer || new _Renderer(this.defaults);
        for (const prop in pack.renderer) {
          if (!(prop in renderer)) {
            throw new Error(`renderer '${prop}' does not exist`);
          }
          if (["options", "parser"].includes(prop)) {
            continue;
          }
          const rendererProp = prop;
          const rendererFunc = pack.renderer[rendererProp];
          const prevRenderer = renderer[rendererProp];
          renderer[rendererProp] = (...args2) => {
            let ret = rendererFunc.apply(renderer, args2);
            if (ret === false) {
              ret = prevRenderer.apply(renderer, args2);
            }
            return ret || "";
          };
        }
        opts.renderer = renderer;
      }
      if (pack.tokenizer) {
        const tokenizer = this.defaults.tokenizer || new _Tokenizer(this.defaults);
        for (const prop in pack.tokenizer) {
          if (!(prop in tokenizer)) {
            throw new Error(`tokenizer '${prop}' does not exist`);
          }
          if (["options", "rules", "lexer"].includes(prop)) {
            continue;
          }
          const tokenizerProp = prop;
          const tokenizerFunc = pack.tokenizer[tokenizerProp];
          const prevTokenizer = tokenizer[tokenizerProp];
          tokenizer[tokenizerProp] = (...args2) => {
            let ret = tokenizerFunc.apply(tokenizer, args2);
            if (ret === false) {
              ret = prevTokenizer.apply(tokenizer, args2);
            }
            return ret;
          };
        }
        opts.tokenizer = tokenizer;
      }
      if (pack.hooks) {
        const hooks = this.defaults.hooks || new _Hooks();
        for (const prop in pack.hooks) {
          if (!(prop in hooks)) {
            throw new Error(`hook '${prop}' does not exist`);
          }
          if (["options", "block"].includes(prop)) {
            continue;
          }
          const hooksProp = prop;
          const hooksFunc = pack.hooks[hooksProp];
          const prevHook = hooks[hooksProp];
          if (_Hooks.passThroughHooks.has(prop)) {
            hooks[hooksProp] = (arg) => {
              if (this.defaults.async) {
                return Promise.resolve(hooksFunc.call(hooks, arg)).then((ret2) => {
                  return prevHook.call(hooks, ret2);
                });
              }
              const ret = hooksFunc.call(hooks, arg);
              return prevHook.call(hooks, ret);
            };
          } else {
            hooks[hooksProp] = (...args2) => {
              let ret = hooksFunc.apply(hooks, args2);
              if (ret === false) {
                ret = prevHook.apply(hooks, args2);
              }
              return ret;
            };
          }
        }
        opts.hooks = hooks;
      }
      if (pack.walkTokens) {
        const walkTokens2 = this.defaults.walkTokens;
        const packWalktokens = pack.walkTokens;
        opts.walkTokens = function(token) {
          let values = [];
          values.push(packWalktokens.call(this, token));
          if (walkTokens2) {
            values = values.concat(walkTokens2.call(this, token));
          }
          return values;
        };
      }
      this.defaults = { ...this.defaults, ...opts };
    });
    return this;
  }
  setOptions(opt) {
    this.defaults = { ...this.defaults, ...opt };
    return this;
  }
  lexer(src, options2) {
    return _Lexer.lex(src, options2 ?? this.defaults);
  }
  parser(tokens, options2) {
    return _Parser.parse(tokens, options2 ?? this.defaults);
  }
  parseMarkdown(blockType) {
    const parse = (src, options2) => {
      const origOpt = { ...options2 };
      const opt = { ...this.defaults, ...origOpt };
      const throwError = this.onError(!!opt.silent, !!opt.async);
      if (this.defaults.async === true && origOpt.async === false) {
        return throwError(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));
      }
      if (typeof src === "undefined" || src === null) {
        return throwError(new Error("marked(): input parameter is undefined or null"));
      }
      if (typeof src !== "string") {
        return throwError(new Error("marked(): input parameter is of type " + Object.prototype.toString.call(src) + ", string expected"));
      }
      if (opt.hooks) {
        opt.hooks.options = opt;
        opt.hooks.block = blockType;
      }
      const lexer2 = opt.hooks ? opt.hooks.provideLexer() : blockType ? _Lexer.lex : _Lexer.lexInline;
      const parser2 = opt.hooks ? opt.hooks.provideParser() : blockType ? _Parser.parse : _Parser.parseInline;
      if (opt.async) {
        return Promise.resolve(opt.hooks ? opt.hooks.preprocess(src) : src).then((src2) => lexer2(src2, opt)).then((tokens) => opt.hooks ? opt.hooks.processAllTokens(tokens) : tokens).then((tokens) => opt.walkTokens ? Promise.all(this.walkTokens(tokens, opt.walkTokens)).then(() => tokens) : tokens).then((tokens) => parser2(tokens, opt)).then((html2) => opt.hooks ? opt.hooks.postprocess(html2) : html2).catch(throwError);
      }
      try {
        if (opt.hooks) {
          src = opt.hooks.preprocess(src);
        }
        let tokens = lexer2(src, opt);
        if (opt.hooks) {
          tokens = opt.hooks.processAllTokens(tokens);
        }
        if (opt.walkTokens) {
          this.walkTokens(tokens, opt.walkTokens);
        }
        let html2 = parser2(tokens, opt);
        if (opt.hooks) {
          html2 = opt.hooks.postprocess(html2);
        }
        return html2;
      } catch (e2) {
        return throwError(e2);
      }
    };
    return parse;
  }
  onError(silent, async) {
    return (e2) => {
      e2.message += "\nPlease report this to https://github.com/markedjs/marked.";
      if (silent) {
        const msg = "<p>An error occurred:</p><pre>" + escape(e2.message + "", true) + "</pre>";
        if (async) {
          return Promise.resolve(msg);
        }
        return msg;
      }
      if (async) {
        return Promise.reject(e2);
      }
      throw e2;
    };
  }
};
var markedInstance = new Marked();
function marked(src, opt) {
  return markedInstance.parse(src, opt);
}
marked.options = marked.setOptions = function(options2) {
  markedInstance.setOptions(options2);
  marked.defaults = markedInstance.defaults;
  changeDefaults(marked.defaults);
  return marked;
};
marked.getDefaults = _getDefaults;
marked.defaults = _defaults;
marked.use = function(...args) {
  markedInstance.use(...args);
  marked.defaults = markedInstance.defaults;
  changeDefaults(marked.defaults);
  return marked;
};
marked.walkTokens = function(tokens, callback) {
  return markedInstance.walkTokens(tokens, callback);
};
marked.parseInline = markedInstance.parseInline;
marked.Parser = _Parser;
marked.parser = _Parser.parse;
marked.Renderer = _Renderer;
marked.TextRenderer = _TextRenderer;
marked.Lexer = _Lexer;
marked.lexer = _Lexer.lex;
marked.Tokenizer = _Tokenizer;
marked.Hooks = _Hooks;
marked.parse = marked;
var options = marked.options;
var setOptions = marked.setOptions;
var use = marked.use;
var walkTokens = marked.walkTokens;
var parseInline = marked.parseInline;
var parser = _Parser.parse;
var lexer = _Lexer.lex;

// node_modules/.pnpm/marked-highlight@2.2.1_marked@15.0.7/node_modules/marked-highlight/src/index.js
function markedHighlight(options2) {
  if (typeof options2 === "function") {
    options2 = {
      highlight: options2
    };
  }
  if (!options2 || typeof options2.highlight !== "function") {
    throw new Error("Must provide highlight function");
  }
  if (typeof options2.langPrefix !== "string") {
    options2.langPrefix = "language-";
  }
  if (typeof options2.emptyLangClass !== "string") {
    options2.emptyLangClass = "";
  }
  return {
    async: !!options2.async,
    walkTokens(token) {
      if (token.type !== "code") {
        return;
      }
      const lang = getLang(token.lang);
      if (options2.async) {
        return Promise.resolve(options2.highlight(token.text, lang, token.lang || "")).then(updateToken(token));
      }
      const code = options2.highlight(token.text, lang, token.lang || "");
      if (code instanceof Promise) {
        throw new Error("markedHighlight is not set to async but the highlight function is async. Set the async option to true on markedHighlight to await the async highlight function.");
      }
      updateToken(token)(code);
    },
    useNewRenderer: true,
    renderer: {
      code(code, infoString, escaped) {
        if (typeof code === "object") {
          escaped = code.escaped;
          infoString = code.lang;
          code = code.text;
        }
        const lang = getLang(infoString);
        const classValue = lang ? options2.langPrefix + escape2(lang) : options2.emptyLangClass;
        const classAttr = classValue ? ` class="${classValue}"` : "";
        code = code.replace(/\n$/, "");
        return `<pre><code${classAttr}>${escaped ? code : escape2(code, true)}
</code></pre>`;
      }
    }
  };
}
function getLang(lang) {
  return (lang || "").match(/\S*/)[0];
}
function updateToken(token) {
  return (code) => {
    if (typeof code === "string" && code !== token.text) {
      token.escaped = true;
      token.text = code;
    }
  };
}
var escapeTest = /[&<>"']/;
var escapeReplace = new RegExp(escapeTest.source, "g");
var escapeTestNoEncode = /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/;
var escapeReplaceNoEncode = new RegExp(escapeTestNoEncode.source, "g");
var escapeReplacements2 = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};
var getEscapeReplacement2 = (ch) => escapeReplacements2[ch];
function escape2(html2, encode) {
  if (encode) {
    if (escapeTest.test(html2)) {
      return html2.replace(escapeReplace, getEscapeReplacement2);
    }
  } else {
    if (escapeTestNoEncode.test(html2)) {
      return html2.replace(escapeReplaceNoEncode, getEscapeReplacement2);
    }
  }
  return html2;
}

// node_modules/.pnpm/@waline+client@3.5.6/node_modules/@waline/client/dist/slim.js
var import_recaptcha_v3 = __toESM(require_ReCaptcha());
var Zt = ["nick", "mail", "link"];
var De = (e2) => e2.filter((l) => Zt.includes(l));
var Pe = ["//unpkg.com/@waline/emojis@1.1.0/weibo"];
var Xt = ["//unpkg.com/@waline/emojis/tieba/tieba_agree.png", "//unpkg.com/@waline/emojis/tieba/tieba_look_down.png", "//unpkg.com/@waline/emojis/tieba/tieba_sunglasses.png", "//unpkg.com/@waline/emojis/tieba/tieba_pick_nose.png", "//unpkg.com/@waline/emojis/tieba/tieba_awkward.png", "//unpkg.com/@waline/emojis/tieba/tieba_sleep.png"];
var Yt = (e2) => new Promise((l, t2) => {
  if (e2.size > 128e3) return t2(new Error("File too large! File size limit 128KB"));
  const a = new FileReader();
  a.readAsDataURL(e2), a.onload = () => l(a.result), a.onerror = t2;
});
var Jt = (e2) => e2 ? '<p class="wl-tex">TeX is not available in preview</p>' : '<span class="wl-tex">TeX is not available in preview</span>';
var Qt = (e2) => {
  const l = async (t2, a = {}) => fetch(`https://api.giphy.com/v1/gifs/${t2}?${new URLSearchParams({ lang: e2, limit: "20", rating: "g", api_key: "6CIMLkNMMOhRcXPoMCPkFy4Ybk2XUiMp", ...a }).toString()}`).then((n2) => n2.json()).then(({ data: n2 }) => n2.map((s2) => ({ title: s2.title, src: s2.images.downsized_medium.url })));
  return { search: (t2) => l("search", { q: t2, offset: "0" }), default: () => l("trending", {}), more: (t2, a = 0) => l("search", { q: t2, offset: a.toString() }) };
};
var ea = /[\u4E00-\u9FFF\u3400-\u4dbf\uf900-\ufaff\u3040-\u309f\uac00-\ud7af\u0400-\u04FF]+|\w+/;
var ta = /</;
var aa = /(?:^|\s)\/\/(.+?)$/gm;
var la = /\/\*([\S\s]*?)\*\//gm;
var na = new RegExp(`(${ea.source}|${ta.source})|((?:${aa.source})|(?:${la.source}))`, "gmi");
var qe = ["23AC69", "91C132", "F19726", "E8552D", "1AAB8E", "E1147F", "2980C1", "1BA1E6", "9FA0A0", "F19726", "E30B20", "E30B20", "A3338B"];
var Ie = {};
var ra = (e2) => {
  let l = 0;
  return e2.replace(na, (t2, a, n2) => {
    if (n2) return `<span style="color: slategray">${n2}</span>`;
    if (a === "<") return "&lt;";
    let s2;
    Ie[a] ? s2 = Ie[a] : (s2 = qe[l], Ie[a] = s2);
    const h2 = `<span style="color: #${s2}">${a}</span>`;
    return l = ++l % qe.length, h2;
  });
};
var oa = ["nick", "nickError", "mail", "mailError", "link", "optional", "placeholder", "sofa", "submit", "like", "cancelLike", "reply", "cancelReply", "comment", "refresh", "more", "preview", "emoji", "uploadImage", "seconds", "minutes", "hours", "days", "now", "uploading", "login", "logout", "admin", "sticky", "word", "wordHint", "anonymous", "level0", "level1", "level2", "level3", "level4", "level5", "gif", "gifSearchPlaceholder", "profile", "approved", "waiting", "spam", "unsticky", "oldest", "latest", "hottest", "reactionTitle"];
var J = (e2) => Object.fromEntries(e2.map((l, t2) => [oa[t2], l]));
var ia = J(["Benutzername", "Der Benutzername darf nicht weniger als 3 Bytes umfassen.", "E-Mail", "Bitte bestätigen Sie Ihre E-Mail-Adresse.", "Webseite", "Optional", "Kommentieren Sie hier...", "Noch keine Kommentare.", "Senden", "Gefällt mir", "Gefällt mir nicht mehr", "Antworten", "Antwort abbrechen", "Kommentare", "Aktualisieren", "Mehr laden...", "Vorschau", "Emoji", "Ein Bild hochladen", "Vor einigen Sekunden", "Vor einigen Minuten", "Vor einigen Stunden", "Vor einigen Tagen", "Gerade eben", "Hochladen läuft", "Anmelden", "Abmelden", "Admin", "Angeheftet", "Wörter", "Bitte geben Sie Kommentare zwischen $0 und $1 Wörtern ein! Aktuelle Anzahl der Wörter: $2", "Anonym", "Zwerge", "Hobbits", "Ents", "Magier", "Elfen", "Maïar", "GIF", "Nach einem GIF suchen", "Profil", "Genehmigt", "Ausstehend", "Spam", "Lösen", "Älteste", "Neueste", "Am beliebtesten", "Was denken Sie?"]);
var Oe = J(["NickName", "NickName cannot be less than 3 bytes.", "E-Mail", "Please confirm your email address.", "Website", "Optional", "Comment here...", "No comment yet.", "Submit", "Like", "Cancel like", "Reply", "Cancel reply", "Comments", "Refresh", "Load More...", "Preview", "Emoji", "Upload Image", "seconds ago", "minutes ago", "hours ago", "days ago", "just now", "Uploading", "Login", "logout", "Admin", "Sticky", "Words", `Please input comments between $0 and $1 words!
 Current word number: $2`, "Anonymous", "Dwarves", "Hobbits", "Ents", "Wizards", "Elves", "Maiar", "GIF", "Search GIF", "Profile", "Approved", "Waiting", "Spam", "Unsticky", "Oldest", "Latest", "Hottest", "What do you think?"]);
var Ge = J(["Nombre de usuario", "El nombre de usuario no puede tener menos de 3 bytes.", "Correo electrónico", "Por favor confirma tu dirección de correo electrónico.", "Sitio web", "Opcional", "Comenta aquí...", "Sin comentarios todavía.", "Enviar", "Like", "Anular like", "Responder", "Anular respuesta", "Comentarios", "Recargar", "Cargar Más...", "Previsualizar", "Emoji", "Subir Imagen", "segundos atrás", "minutos atrás", "horas atrás", "días atrás", "justo ahora", "Subiendo", "Iniciar sesión", "cerrar sesión", "Admin", "Fijado", "Palabras", `Por favor escriba entre $0 y $1 palabras!
 El número actual de palabras: $2`, "Anónimo", "Enanos", "Hobbits", "Ents", "Magos", "Elfos", "Maiar", "GIF", "Buscar GIF", "Perfil", "Aprobado", "Esperando", "Spam", "Desfijar", "Más antiguos", "Más recientes", "Más vistos", "¿Qué piensas?"]);
var Ke = J(["Pseudo", "Le pseudo ne peut pas faire moins de 3 octets.", "E-mail", "Veuillez confirmer votre adresse e-mail.", "Site Web", "Optionnel", "Commentez ici...", "Aucun commentaire pour l'instant.", "Envoyer", "J'aime", "Annuler le j'aime", "Répondre", "Annuler la réponse", "Commentaires", "Actualiser", "Charger plus...", "Aperçu", "Emoji", "Télécharger une image", "Il y a quelques secondes", "Il y a quelques minutes", "Il y a quelques heures", "Il y a quelques jours", "À l'instant", "Téléchargement en cours", "Connexion", "Déconnexion", "Admin", "Épinglé", "Mots", `Veuillez saisir des commentaires entre $0 et $1 mots !
 Nombre actuel de mots : $2`, "Anonyme", "Nains", "Hobbits", "Ents", "Mages", "Elfes", "Maïar", "GIF", "Rechercher un GIF", "Profil", "Approuvé", "En attente", "Indésirable", "Détacher", "Le plus ancien", "Dernier", "Le plus populaire", "Qu'en pensez-vous ?"]);
var Ze = J(["ニックネーム", "3バイト以上のニックネームをご入力ください.", "メールアドレス", "メールアドレスをご確認ください.", "サイト", "オプション", "ここにコメント", "コメントしましょう~", "提出する", "Like", "Cancel like", "返信する", "キャンセル", "コメント", "更新", "さらに読み込む", "プレビュー", "絵文字", "画像をアップロード", "秒前", "分前", "時間前", "日前", "たっだ今", "アップロード", "ログインする", "ログアウト", "管理者", "トップに置く", "ワード", `コメントは $0 から $1 ワードの間でなければなりません!
 現在の単語番号: $2`, "匿名", "うえにん", "なかにん", "しもおし", "特にしもおし", "かげ", "なぬし", "GIF", "探す GIF", "個人情報", "承認済み", "待っている", "スパム", "べたつかない", "逆順", "正順", "人気順", "どう思いますか？"]);
var sa = J(["Apelido", "Apelido não pode ser menor que 3 bytes.", "E-Mail", "Por favor, confirme seu endereço de e-mail.", "Website", "Opcional", "Comente aqui...", "Nenhum comentário, ainda.", "Enviar", "Like", "Cancel like", "Responder", "Cancelar resposta", "Comentários", "Refrescar", "Carregar Mais...", "Visualizar", "Emoji", "Enviar Imagem", "segundos atrás", "minutos atrás", "horas atrás", "dias atrás", "agora mesmo", "Enviando", "Entrar", "Sair", "Admin", "Sticky", "Palavras", `Favor enviar comentário com $0 a $1 palavras!
 Número de palavras atuais: $2`, "Anônimo", "Dwarves", "Hobbits", "Ents", "Wizards", "Elves", "Maiar", "GIF", "Pesquisar GIF", "informação pessoal", "Aprovado", "Espera", "Spam", "Unsticky", "Mais velho", "Mais recentes", "Mais quente", "O que você acha?"]);
var Xe = J(["Псевдоним", "Никнейм не может быть меньше 3 байт.", "Эл. адрес", "Пожалуйста, подтвердите адрес вашей электронной почты.", "Веб-сайт", "Необязательный", "Комментарий здесь...", "Пока нет комментариев.", "Отправить", "Like", "Cancel like", "Отвечать", "Отменить ответ", "Комментарии", "Обновить", "Загрузи больше...", "Превью", "эмодзи", "Загрузить изображение", "секунд назад", "несколько минут назад", "несколько часов назад", "дней назад", "прямо сейчас", "Загрузка", "Авторизоваться", "Выход из системы", "Админ", "Липкий", "Слова", `Пожалуйста, введите комментарии от $0 до $1 слов!
Номер текущего слова: $2`, "Анонимный", "Dwarves", "Hobbits", "Ents", "Wizards", "Elves", "Maiar", "GIF", "Поиск GIF", "Персональные данные", "Одобренный", "Ожидающий", "Спам", "Нелипкий", "самый старый", "последний", "самый горячий", "Что вы думаете?"]);
var Ye = J(["Tên", "Tên không được nhỏ hơn 3 ký tự.", "E-Mail", "Vui lòng xác nhập địa chỉ email của bạn.", "Website", "Tùy chọn", "Hãy bình luận có văn hoá!", "Chưa có bình luận", "Gửi", "Thích", "Bỏ thích", "Trả lời", "Hủy bỏ", "bình luận", "Làm mới", "Tải thêm...", "Xem trước", "Emoji", "Tải lên hình ảnh", "giây trước", "phút trước", "giờ trước", "ngày trước", "Vừa xong", "Đang tải lên", "Đăng nhập", "đăng xuất", "Quản trị viên", "Dính", "từ", `Bình luận phải có độ dài giữa $0 và $1 từ!
 Số từ hiện tại: $2`, "Vô danh", "Người lùn", "Người tí hon", "Thần rừng", "Pháp sư", "Tiên tộc", "Maiar", "Ảnh GIF", "Tìm kiếm ảnh GIF", "thông tin cá nhân", "Đã được phê duyệt", "Đang chờ đợi", "Thư rác", "Không dính", "lâu đời nhất", "muộn nhất", "nóng nhất", "What do you think?"]);
var Je = J(["昵称", "昵称不能少于3个字符", "邮箱", "请填写正确的邮件地址", "网址", "可选", "欢迎评论", "来发评论吧~", "提交", "喜欢", "取消喜欢", "回复", "取消回复", "评论", "刷新", "加载更多...", "预览", "表情", "上传图片", "秒前", "分钟前", "小时前", "天前", "刚刚", "正在上传", "登录", "退出", "博主", "置顶", "字", `评论字数应在 $0 到 $1 字之间！
当前字数：$2`, "匿名", "潜水", "冒泡", "吐槽", "活跃", "话痨", "传说", "表情包", "搜索表情包", "个人资料", "通过", "待审核", "垃圾", "取消置顶", "按倒序", "按正序", "按热度", "你认为这篇文章怎么样？"]);
var ca = J(["暱稱", "暱稱不能少於3個字元", "郵箱", "請填寫正確的郵件地址", "網址", "可選", "歡迎留言", "來發留言吧~", "送出", "喜歡", "取消喜歡", "回覆", "取消回覆", "留言", "重整", "載入更多...", "預覽", "表情", "上傳圖片", "秒前", "分鐘前", "小時前", "天前", "剛剛", "正在上傳", "登入", "登出", "管理者", "置頂", "字", `留言字數應在 $0 到 $1 字之間！
目前字數：$2`, "匿名", "潛水", "冒泡", "吐槽", "活躍", "多話", "傳說", "表情包", "搜尋表情包", "個人資料", "通過", "待審核", "垃圾", "取消置頂", "最早", "最新", "熱門", "你認為這篇文章怎麼樣？"]);
var Qe = "en-US";
var fe = { zh: Je, "zh-cn": Je, "zh-tw": ca, en: Oe, "en-us": Oe, fr: Ke, "fr-fr": Ke, jp: Ze, "jp-jp": Ze, "pt-br": sa, ru: Xe, "ru-ru": Xe, vi: Ye, "vi-vn": Ye, de: ia, es: Ge, "es-mx": Ge };
var et = (e2) => fe[e2.toLowerCase()] || fe[Qe.toLowerCase()];
var tt = (e2) => Object.keys(fe).includes(e2.toLowerCase()) ? e2 : Qe;
var at = { latest: "insertedAt_desc", oldest: "insertedAt_asc", hottest: "like_desc" };
var ua = Object.keys(at);
var we = Symbol("waline-config");
var lt = (e2) => {
  try {
    e2 = decodeURI(e2);
  } catch {
  }
  return e2;
};
var nt = (e2 = "") => e2.replace(/\/$/u, "");
var rt = (e2) => /^(https?:)?\/\//.test(e2);
var ye = (e2) => {
  const l = nt(e2);
  return rt(l) ? l : `https://${l}`;
};
var ma = (e2) => Array.isArray(e2) ? e2 : e2 ? [0, e2] : false;
var re = (e2, l) => e2 == null || e2 === true ? l : e2 === false ? null : e2;
var va = ({ serverURL: e2, path: l = location.pathname, lang: t2 = typeof navigator > "u" ? "en-US" : navigator.language, locale: a, meta: n2 = ["nick", "mail", "link"], requiredMeta: s2 = [], dark: h2 = false, pageSize: c2 = 10, wordLimit: f2, noCopyright: v2 = false, login: y2 = "enable", recaptchaV3Key: m2 = "", turnstileKey: R2 = "", commentSorting: j2 = "latest", emoji: E = Pe, imageUploader: $2, highlighter: S, texRenderer: i, search: g, reaction: K, ...X }) => ({ serverURL: ye(e2), path: lt(l), lang: tt(t2), locale: { ...et(tt(t2)), ...typeof a == "object" ? a : {} }, wordLimit: ma(f2), meta: De(n2), requiredMeta: De(s2), dark: h2, pageSize: c2, commentSorting: j2, login: y2, noCopyright: v2, recaptchaV3Key: m2, turnstileKey: R2, ...X, reaction: re(K, Xt), imageUploader: re($2, Yt), highlighter: re(S, ra), texRenderer: re(i, Jt), emoji: re(E, Pe), search: re(g, Qt(t2)) });
var oe = (e2) => typeof e2 == "string";
var Ae = "{--waline-white:#000;--waline-light-grey:#666;--waline-dark-grey:#999;--waline-color:#888;--waline-bg-color:#1e1e1e;--waline-bg-color-light:#272727;--waline-bg-color-hover: #444;--waline-border-color:#333;--waline-disable-bg-color:#444;--waline-disable-color:#272727;--waline-bq-color:#272727;--waline-info-bg-color:#272727;--waline-info-color:#666}";
var da = (e2) => oe(e2) ? e2 === "auto" ? `@media(prefers-color-scheme:dark){body${Ae}}` : `${e2}${Ae}` : e2 === true ? `:root${Ae}` : "";
var Me = (e2, l) => {
  let t2 = e2.toString();
  for (; t2.length < l; ) t2 = "0" + t2;
  return t2;
};
var pa = (e2) => {
  const l = Me(e2.getDate(), 2), t2 = Me(e2.getMonth() + 1, 2);
  return `${Me(e2.getFullYear(), 2)}-${t2}-${l}`;
};
var ga = (e2, l, t2) => {
  if (!e2) return "";
  const a = oe(e2) ? new Date(e2.includes(" ") ? e2.replace(/-/g, "/") : e2) : e2, n2 = l.getTime() - a.getTime(), s2 = Math.floor(n2 / (24 * 3600 * 1e3));
  if (s2 === 0) {
    const h2 = n2 % 864e5, c2 = Math.floor(h2 / (3600 * 1e3));
    if (c2 === 0) {
      const f2 = h2 % 36e5, v2 = Math.floor(f2 / (60 * 1e3));
      if (v2 === 0) {
        const y2 = f2 % 6e4;
        return `${Math.round(y2 / 1e3)} ${t2.seconds}`;
      }
      return `${v2} ${t2.minutes}`;
    }
    return `${c2} ${t2.hours}`;
  }
  return s2 < 0 ? t2.now : s2 < 8 ? `${s2} ${t2.days}` : pa(a);
};
var ha = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
var fa = (e2) => ha.test(e2);
var wa = "WALINE_EMOJI";
var ot = useStorage(wa, {});
var ya = (e2) => !!/@[0-9]+\.[0-9]+\.[0-9]+/.test(e2);
var ba = (e2) => {
  const l = ya(e2);
  if (l) {
    const t2 = ot.value[e2];
    if (t2) return Promise.resolve(t2);
  }
  return fetch(`${e2}/info.json`).then((t2) => t2.json()).then((t2) => {
    const a = { folder: e2, ...t2 };
    return l && (ot.value[e2] = a), a;
  });
};
var it = (e2, l = "", t2 = "", a = "") => `${l ? `${l}/` : ""}${t2}${e2}${a ? `.${a}` : ""}`;
var ka = (e2) => Promise.all(e2 ? e2.map((l) => oe(l) ? ba(nt(l)) : Promise.resolve(l)) : []).then((l) => {
  const t2 = { tabs: [], map: {} };
  return l.forEach((a) => {
    const { name: n2, folder: s2, icon: h2, prefix: c2 = "", type: f2, items: v2 } = a;
    t2.tabs.push({ name: n2, icon: it(h2, s2, c2, f2), items: v2.map((y2) => {
      const m2 = `${c2}${y2}`;
      return t2.map[m2] = it(y2, s2, c2, f2), m2;
    }) });
  }), t2;
});
var st = (e2) => {
  e2.name !== "AbortError" && console.error(e2.message);
};
var xe = (e2) => e2 instanceof HTMLElement ? e2 : oe(e2) ? document.querySelector(e2) : null;
var Ca = (e2) => e2.type.includes("image");
var ct = (e2) => {
  const l = Array.from(e2).find(Ca);
  return l ? l.getAsFile() : null;
};
var $a = /\$.*?\$/;
var La = /^\$(.*?)\$/;
var Ea = /^(?:\s{0,3})\$\$((?:[^\n]|\n[^\n])+?)\n{0,1}\$\$/;
var Ia = (e2) => [{ name: "blockMath", level: "block", tokenizer(l) {
  const t2 = Ea.exec(l);
  if (t2 !== null) return { type: "html", raw: t2[0], text: e2(true, t2[1]) };
} }, { name: "inlineMath", level: "inline", start(l) {
  const t2 = l.search($a);
  return t2 !== -1 ? t2 : l.length;
}, tokenizer(l) {
  const t2 = La.exec(l);
  if (t2 !== null) return { type: "html", raw: t2[0], text: e2(false, t2[1]) };
} }];
var ut = (e2 = "", l = {}) => e2.replace(/:(.+?):/g, (t2, a) => l[a] ? `<img class="wl-emoji" src="${l[a]}" alt="${a}">` : t2);
var Aa = (e2, { emojiMap: l, highlighter: t2, texRenderer: a }) => {
  const n2 = new Marked();
  if (n2.setOptions({ breaks: true }), t2 && n2.use(markedHighlight({ highlight: t2 })), a) {
    const s2 = Ia(a);
    n2.use({ extensions: s2 });
  }
  return n2.parse(ut(e2, l));
};
var Re = (e2) => {
  const { path: l } = e2.dataset;
  return l != null && l.length ? l : null;
};
var Ma = (e2) => e2.match(/[\w\d\s,.\u00C0-\u024F\u0400-\u04FF]+/giu);
var xa = (e2) => e2.match(/[\u4E00-\u9FD5]/gu);
var Ra = (e2) => {
  var l, t2;
  return (((l = Ma(e2)) == null ? void 0 : l.reduce((a, n2) => a + (["", ",", "."].includes(n2.trim()) ? 0 : n2.trim().split(/\s+/u).length), 0)) ?? 0) + (((t2 = xa(e2)) == null ? void 0 : t2.length) ?? 0);
};
var Sa = async () => {
  const { userAgentData: e2 } = navigator;
  let l = navigator.userAgent;
  if (!e2 || e2.platform !== "Windows") return l;
  const { platformVersion: t2 } = await e2.getHighEntropyValues(["platformVersion"]);
  return t2 && parseInt(t2.split(".")[0]) >= 13 && (l = l.replace("Windows NT 10.0", "Windows NT 11.0")), l;
};
var mt = ({ serverURL: e2, path: l = window.location.pathname, selector: t2 = ".waline-comment-count", lang: a = navigator.language }) => {
  const n2 = new AbortController(), s2 = document.querySelectorAll(t2);
  return s2.length && f({ serverURL: ye(e2), paths: Array.from(s2).map((h2) => lt(Re(h2) ?? l)), lang: a, signal: n2.signal }).then((h2) => {
    s2.forEach((c2, f2) => {
      c2.innerText = h2[f2].toString();
    });
  }).catch(st), n2.abort.bind(n2);
};
var vt = ({ size: e2 }) => h("svg", { class: "wl-close-icon", viewBox: "0 0 1024 1024", width: e2, height: e2 }, [h("path", { d: "M697.173 85.333h-369.92c-144.64 0-241.92 101.547-241.92 252.587v348.587c0 150.613 97.28 252.16 241.92 252.16h369.92c144.64 0 241.494-101.547 241.494-252.16V337.92c0-151.04-96.854-252.587-241.494-252.587z", fill: "currentColor" }), h("path", { d: "m640.683 587.52-75.947-75.861 75.904-75.862a37.29 37.29 0 0 0 0-52.778 37.205 37.205 0 0 0-52.779 0l-75.946 75.818-75.862-75.946a37.419 37.419 0 0 0-52.821 0 37.419 37.419 0 0 0 0 52.821l75.947 75.947-75.776 75.733a37.29 37.29 0 1 0 52.778 52.821l75.776-75.776 75.947 75.947a37.376 37.376 0 0 0 52.779-52.821z", fill: "#888" })]);
var ja = () => h("svg", { viewBox: "0 0 1024 1024", width: "24", height: "24" }, h("path", { d: "m341.013 394.667 27.755 393.45h271.83l27.733-393.45h64.106l-28.01 397.952a64 64 0 0 1-63.83 59.498H368.768a64 64 0 0 1-63.83-59.52l-28.053-397.93h64.128zm139.307 19.818v298.667h-64V414.485h64zm117.013 0v298.667h-64V414.485h64zM181.333 288h640v64h-640v-64zm453.483-106.667v64h-256v-64h256z", fill: "red" }));
var Ua = () => h("svg", { viewBox: "0 0 1024 1024", width: "24", height: "24" }, h("path", { d: "M563.2 463.3 677 540c1.7 1.2 3.7 1.8 5.8 1.8.7 0 1.4-.1 2-.2 2.7-.5 5.1-2.1 6.6-4.4l25.3-37.8c1.5-2.3 2.1-5.1 1.6-7.8s-2.1-5.1-4.4-6.6l-73.6-49.1 73.6-49.1c2.3-1.5 3.9-3.9 4.4-6.6.5-2.7 0-5.5-1.6-7.8l-25.3-37.8a10.1 10.1 0 0 0-6.6-4.4c-.7-.1-1.3-.2-2-.2-2.1 0-4.1.6-5.8 1.8l-113.8 76.6c-9.2 6.2-14.7 16.4-14.7 27.5.1 11 5.5 21.3 14.7 27.4zM387 348.8h-45.5c-5.7 0-10.4 4.7-10.4 10.4v153.3c0 5.7 4.7 10.4 10.4 10.4H387c5.7 0 10.4-4.7 10.4-10.4V359.2c0-5.7-4.7-10.4-10.4-10.4zm333.8 241.3-41-20a10.3 10.3 0 0 0-8.1-.5c-2.6.9-4.8 2.9-5.9 5.4-30.1 64.9-93.1 109.1-164.4 115.2-5.7.5-9.9 5.5-9.5 11.2l3.9 45.5c.5 5.3 5 9.5 10.3 9.5h.9c94.8-8 178.5-66.5 218.6-152.7 2.4-5 .3-11.2-4.8-13.6zm186-186.1c-11.9-42-30.5-81.4-55.2-117.1-24.1-34.9-53.5-65.6-87.5-91.2-33.9-25.6-71.5-45.5-111.6-59.2-41.2-14-84.1-21.1-127.8-21.1h-1.2c-75.4 0-148.8 21.4-212.5 61.7-63.7 40.3-114.3 97.6-146.5 165.8-32.2 68.1-44.3 143.6-35.1 218.4 9.3 74.8 39.4 145 87.3 203.3.1.2.3.3.4.5l36.2 38.4c1.1 1.2 2.5 2.1 3.9 2.6 73.3 66.7 168.2 103.5 267.5 103.5 73.3 0 145.2-20.3 207.7-58.7 37.3-22.9 70.3-51.5 98.1-85 27.1-32.7 48.7-69.5 64.2-109.1 15.5-39.7 24.4-81.3 26.6-123.8 2.4-43.6-2.5-87-14.5-129zm-60.5 181.1c-8.3 37-22.8 72-43 104-19.7 31.1-44.3 58.6-73.1 81.7-28.8 23.1-61 41-95.7 53.4-35.6 12.7-72.9 19.1-110.9 19.1-82.6 0-161.7-30.6-222.8-86.2l-34.1-35.8c-23.9-29.3-42.4-62.2-55.1-97.7-12.4-34.7-18.8-71-19.2-107.9-.4-36.9 5.4-73.3 17.1-108.2 12-35.8 30-69.2 53.4-99.1 31.7-40.4 71.1-72 117.2-94.1 44.5-21.3 94-32.6 143.4-32.6 49.3 0 97 10.8 141.8 32 34.3 16.3 65.3 38.1 92 64.8 26.1 26 47.5 56 63.6 89.2 16.2 33.2 26.6 68.5 31 105.1 4.6 37.5 2.7 75.3-5.6 112.3z", fill: "currentColor" }));
var za = () => h("svg", { viewBox: "0 0 1024 1024", width: "24", height: "24" }, [h("path", { d: "M784 112H240c-88 0-160 72-160 160v480c0 88 72 160 160 160h544c88 0 160-72 160-160V272c0-88-72-160-160-160zm96 640c0 52.8-43.2 96-96 96H240c-52.8 0-96-43.2-96-96V272c0-52.8 43.2-96 96-96h544c52.8 0 96 43.2 96 96v480z", fill: "currentColor" }), h("path", { d: "M352 480c52.8 0 96-43.2 96-96s-43.2-96-96-96-96 43.2-96 96 43.2 96 96 96zm0-128c17.6 0 32 14.4 32 32s-14.4 32-32 32-32-14.4-32-32 14.4-32 32-32zm462.4 379.2-3.2-3.2-177.6-177.6c-25.6-25.6-65.6-25.6-91.2 0l-80 80-36.8-36.8c-25.6-25.6-65.6-25.6-91.2 0L200 728c-4.8 6.4-8 14.4-8 24 0 17.6 14.4 32 32 32 9.6 0 16-3.2 22.4-9.6L380.8 640l134.4 134.4c6.4 6.4 14.4 9.6 24 9.6 17.6 0 32-14.4 32-32 0-9.6-4.8-17.6-9.6-24l-52.8-52.8 80-80L769.6 776c6.4 4.8 12.8 8 20.8 8 17.6 0 32-14.4 32-32 0-8-3.2-16-8-20.8z", fill: "currentColor" })]);
var Va = ({ active: e2 = false }) => h("svg", { viewBox: "0 0 1024 1024", width: "24", height: "24" }, [h("path", { d: `M850.654 323.804c-11.042-25.625-26.862-48.532-46.885-68.225-20.022-19.61-43.258-34.936-69.213-45.73-26.78-11.124-55.124-16.727-84.375-16.727-40.622 0-80.256 11.123-114.698 32.135A214.79 214.79 0 0 0 512 241.819a214.79 214.79 0 0 0-23.483-16.562c-34.442-21.012-74.076-32.135-114.698-32.135-29.25 0-57.595 5.603-84.375 16.727-25.872 10.711-49.19 26.12-69.213 45.73-20.105 19.693-35.843 42.6-46.885 68.225-11.453 26.615-17.303 54.877-17.303 83.963 0 27.439 5.603 56.03 16.727 85.117 9.31 24.307 22.659 49.52 39.715 74.981 27.027 40.293 64.188 82.316 110.33 124.915 76.465 70.615 152.189 119.394 155.402 121.371l19.528 12.525c8.652 5.52 19.776 5.52 28.427 0l19.529-12.525c3.213-2.06 78.854-50.756 155.401-121.371 46.143-42.6 83.304-84.622 110.33-124.915 17.057-25.46 30.487-50.674 39.716-74.981 11.124-29.087 16.727-57.678 16.727-85.117.082-29.086-5.768-57.348-17.221-83.963z${e2 ? "" : "M512 761.5S218.665 573.55 218.665 407.767c0-83.963 69.461-152.023 155.154-152.023 60.233 0 112.473 33.618 138.181 82.727 25.708-49.109 77.948-82.727 138.18-82.727 85.694 0 155.155 68.06 155.155 152.023C805.335 573.551 512 761.5 512 761.5z"}`, fill: e2 ? "red" : "currentColor" })]);
var _a = () => h("svg", { viewBox: "0 0 1024 1024", width: "24", height: "24" }, [h("path", { d: "M710.816 654.301c70.323-96.639 61.084-230.578-23.705-314.843-46.098-46.098-107.183-71.109-172.28-71.109-65.008 0-126.092 25.444-172.28 71.109-45.227 46.098-70.756 107.183-70.756 172.106 0 64.923 25.444 126.007 71.194 172.106 46.099 46.098 107.184 71.109 172.28 71.109 51.414 0 100.648-16.212 142.824-47.404l126.53 126.006c7.058 7.06 16.297 10.979 26.406 10.979 10.105 0 19.343-3.919 26.402-10.979 14.467-14.467 14.467-38.172 0-52.723L710.816 654.301zm-315.107-23.265c-65.88-65.88-65.88-172.54 0-238.42 32.069-32.07 74.245-49.149 119.471-49.149 45.227 0 87.407 17.603 119.472 49.149 65.88 65.879 65.88 172.539 0 238.42-63.612 63.178-175.242 63.178-238.943 0zm0 0", fill: "currentColor" }), h("path", { d: "M703.319 121.603H321.03c-109.8 0-199.469 89.146-199.469 199.38v382.034c0 109.796 89.236 199.38 199.469 199.38h207.397c20.653 0 37.384-16.645 37.384-37.299 0-20.649-16.731-37.296-37.384-37.296H321.03c-68.582 0-124.352-55.77-124.352-124.267V321.421c0-68.496 55.77-124.267 124.352-124.267h382.289c68.582 0 124.352 55.771 124.352 124.267V524.72c0 20.654 16.736 37.299 37.385 37.299 20.654 0 37.384-16.645 37.384-37.299V320.549c-.085-109.8-89.321-198.946-199.121-198.946zm0 0", fill: "currentColor" })]);
var Ha = () => h("svg", { width: "16", height: "16", ariaHidden: "true" }, h("path", { d: "M14.85 3H1.15C.52 3 0 3.52 0 4.15v7.69C0 12.48.52 13 1.15 13h13.69c.64 0 1.15-.52 1.15-1.15v-7.7C16 3.52 15.48 3 14.85 3zM9 11H7V8L5.5 9.92 4 8v3H2V5h2l1.5 2L7 5h2v6zm2.99.5L9.5 8H11V5h2v3h1.5l-2.51 3.5z", fill: "currentColor" }));
var Ta = () => h("svg", { viewBox: "0 0 1024 1024", width: "24", height: "24" }, h("path", { d: "M810.667 213.333a64 64 0 0 1 64 64V704a64 64 0 0 1-64 64H478.336l-146.645 96.107a21.333 21.333 0 0 1-33.024-17.856V768h-85.334a64 64 0 0 1-64-64V277.333a64 64 0 0 1 64-64h597.334zm0 64H213.333V704h149.334v63.296L459.243 704h351.424V277.333zm-271.36 213.334v64h-176.64v-64h176.64zm122.026-128v64H362.667v-64h298.666z", fill: "currentColor" }));
var Fa = () => h("svg", { viewBox: "0 0 1024 1024", width: "24", height: "24" }, h("path", { d: "M813.039 318.772L480.53 651.278H360.718V531.463L693.227 198.961C697.904 194.284 704.027 192 710.157 192C716.302 192 722.436 194.284 727.114 198.961L813.039 284.88C817.72 289.561 820 295.684 820 301.825C820 307.95 817.72 314.093 813.039 318.772ZM710.172 261.888L420.624 551.431V591.376H460.561L750.109 301.825L710.172 261.888ZM490.517 291.845H240.906V771.09H720.156V521.479C720.156 504.947 733.559 491.529 750.109 491.529C766.653 491.529 780.063 504.947 780.063 521.479V791.059C780.063 813.118 762.18 831 740.125 831H220.937C198.882 831 181 813.118 181 791.059V271.872C181 249.817 198.882 231.935 220.937 231.935H490.517C507.06 231.935 520.47 245.352 520.47 261.888C520.47 278.424 507.06 291.845 490.517 291.845Z", fill: "currentColor" }));
var Na = () => h("svg", { class: "verified-icon", viewBox: "0 0 1024 1024", width: "14", height: "14" }, h("path", { d: "m894.4 461.56-54.4-63.2c-10.4-12-18.8-34.4-18.8-50.4v-68c0-42.4-34.8-77.2-77.2-77.2h-68c-15.6 0-38.4-8.4-50.4-18.8l-63.2-54.4c-27.6-23.6-72.8-23.6-100.8 0l-62.8 54.8c-12 10-34.8 18.4-50.4 18.4h-69.2c-42.4 0-77.2 34.8-77.2 77.2v68.4c0 15.6-8.4 38-18.4 50l-54 63.6c-23.2 27.6-23.2 72.4 0 100l54 63.6c10 12 18.4 34.4 18.4 50v68.4c0 42.4 34.8 77.2 77.2 77.2h69.2c15.6 0 38.4 8.4 50.4 18.8l63.2 54.4c27.6 23.6 72.8 23.6 100.8 0l63.2-54.4c12-10.4 34.4-18.8 50.4-18.8h68c42.4 0 77.2-34.8 77.2-77.2v-68c0-15.6 8.4-38.4 18.8-50.4l54.4-63.2c23.2-27.6 23.2-73.2-.4-100.8zm-216-25.2-193.2 193.2a30 30 0 0 1-42.4 0l-96.8-96.8a30.16 30.16 0 0 1 0-42.4c11.6-11.6 30.8-11.6 42.4 0l75.6 75.6 172-172c11.6-11.6 30.8-11.6 42.4 0 11.6 11.6 11.6 30.8 0 42.4z", fill: "#27ae60" }));
var ue = ({ size: e2 = 100 }) => h("svg", { width: e2, height: e2, viewBox: "0 0 100 100", preserveAspectRatio: "xMidYMid" }, h("circle", { cx: 50, cy: 50, fill: "none", stroke: "currentColor", strokeWidth: "4", r: "40", "stroke-dasharray": "85 30" }, h("animateTransform", { attributeName: "transform", type: "rotate", repeatCount: "indefinite", dur: "1s", values: "0 50 50;360 50 50", keyTimes: "0;1" })));
var Wa = () => h("svg", { width: 24, height: 24, fill: "currentcolor", viewBox: "0 0 24 24" }, [h("path", { style: "transform: translateY(0.5px)", d: "M18.968 10.5H15.968V11.484H17.984V12.984H15.968V15H14.468V9H18.968V10.5V10.5ZM8.984 9C9.26533 9 9.49967 9.09367 9.687 9.281C9.87433 9.46833 9.968 9.70267 9.968 9.984V10.5H6.499V13.5H8.468V12H9.968V14.016C9.968 14.2973 9.87433 14.5317 9.687 14.719C9.49967 14.9063 9.26533 15 8.984 15H5.984C5.70267 15 5.46833 14.9063 5.281 14.719C5.09367 14.5317 5 14.2973 5 14.016V9.985C5 9.70367 5.09367 9.46933 5.281 9.282C5.46833 9.09467 5.70267 9.001 5.984 9.001H8.984V9ZM11.468 9H12.968V15H11.468V9V9Z" }), h("path", { d: "M18.5 3H5.75C3.6875 3 2 4.6875 2 6.75V18C2 20.0625 3.6875 21.75 5.75 21.75H18.5C20.5625 21.75 22.25 20.0625 22.25 18V6.75C22.25 4.6875 20.5625 3 18.5 3ZM20.75 18C20.75 19.2375 19.7375 20.25 18.5 20.25H5.75C4.5125 20.25 3.5 19.2375 3.5 18V6.75C3.5 5.5125 4.5125 4.5 5.75 4.5H18.5C19.7375 4.5 20.75 5.5125 20.75 6.75V18Z" })]);
var Ba = () => useStorage("WALINE_USER_META", { nick: "", mail: "", link: "" });
var Da = () => useStorage("WALINE_COMMENT_BOX_EDITOR", "");
var Pa = "WALINE_LIKE";
var qa = useStorage(Pa, []);
var dt = () => qa;
var Oa = "WALINE_REACTION";
var Ga = useStorage(Oa, {});
var Ka = () => Ga;
var pt = {};
var Za = (e2) => {
  const l = pt[e2] ?? (pt[e2] = (0, import_recaptcha_v3.load)(e2, { useRecaptchaNet: true, autoHideBadge: true }));
  return { execute: (t2) => l.then((a) => a.execute(t2)) };
};
var Xa = (e2) => ({ execute: async (l) => {
  const { load: t2 } = useScriptTag("https://challenges.cloudflare.com/turnstile/v0/api.js", void 0, { async: false });
  await t2();
  const a = window.turnstile;
  return new Promise((n2) => {
    a == null || a.ready(() => {
      a.render(".wl-captcha-container", { sitekey: e2, action: l, size: "compact", callback: n2 });
    });
  });
} });
var Ya = "WALINE_USER";
var Ja = useStorage(Ya, {});
var be = () => Ja;
var Qa = { key: 0, class: "wl-reaction" };
var el = ["textContent"];
var tl = { class: "wl-reaction-list" };
var al = ["onClick"];
var ll = { class: "wl-reaction-img" };
var nl = ["src", "alt"];
var rl = ["textContent"];
var ol = ["textContent"];
var il = defineComponent({ __name: "ArticleReaction", setup(e2) {
  const l = Ka(), t2 = inject(we), a = ref(-1), n2 = ref([]), s2 = computed(() => t2.value.locale), h2 = computed(() => {
    const { reaction: m2 } = t2.value;
    return m2 != null && m2.length ? m2 : null;
  }), c2 = computed(() => {
    var m2;
    const { path: R2 } = t2.value;
    return ((m2 = h2.value) == null ? void 0 : m2.map((j2, E) => ({ icon: j2, desc: s2.value[`reaction${E}`], active: l.value[R2] === E }))) ?? null;
  });
  let f2;
  const v2 = async () => {
    const { serverURL: m2, lang: R2, path: j2 } = t2.value;
    if (!h2.value) return;
    const E = new AbortController();
    f2 = E.abort.bind(E);
    const [$2] = await p({ serverURL: m2, lang: R2, paths: [j2], type: h2.value.map((S, i) => `reaction${i}`), signal: E.signal });
    n2.value = h2.value.map((S, i) => $2[`reaction${i}`]);
  }, y2 = async (m2) => {
    if (a.value !== -1) return;
    const { serverURL: R2, lang: j2, path: E } = t2.value, $2 = l.value[E];
    a.value = m2, $2 !== void 0 && (await d({ serverURL: R2, lang: j2, path: E, type: `reaction${$2}`, action: "desc" }), n2.value[$2] = Math.max(n2.value[$2] - 1, 0)), $2 !== m2 && (await d({ serverURL: R2, lang: j2, path: E, type: `reaction${m2}` }), n2.value[m2] = (n2.value[m2] || 0) + 1), $2 === m2 ? delete l.value[E] : l.value[E] = m2, a.value = -1;
  };
  return onMounted(() => {
    watchImmediate(() => [t2.value.serverURL, t2.value.path], () => v2());
  }), onUnmounted(() => {
    f2 == null || f2();
  }), (m2, R2) => c2.value ? (openBlock(), createElementBlock("div", Qa, [createBaseVNode("div", { class: "wl-reaction-title", textContent: toDisplayString(s2.value.reactionTitle) }, null, 8, el), createBaseVNode("ul", tl, [(openBlock(true), createElementBlock(Fragment, null, renderList(c2.value, ({ active: j2, icon: E, desc: $2 }, S) => (openBlock(), createElementBlock("li", { key: S, class: normalizeClass(["wl-reaction-item", { active: j2 }]), onClick: (i) => y2(S) }, [createBaseVNode("div", ll, [createBaseVNode("img", { src: E, alt: $2 }, null, 8, nl), a.value === S ? (openBlock(), createBlock(unref(ue), { key: 0, class: "wl-reaction-loading" })) : (openBlock(), createElementBlock("div", { key: 1, class: "wl-reaction-votes", textContent: toDisplayString(n2.value[S] || 0) }, null, 8, rl))]), createBaseVNode("div", { class: "wl-reaction-text", textContent: toDisplayString($2) }, null, 8, ol)], 10, al))), 128))])])) : createCommentVNode("v-if", true);
} });
var sl = ["data-index"];
var cl = ["src", "title", "onClick"];
var ul = defineComponent({ __name: "ImageWall", props: { items: { default: () => [] }, columnWidth: { default: 300 }, gap: { default: 0 } }, emits: ["insert"], setup(e2) {
  const l = e2;
  let t2 = null;
  const a = useTemplateRef("wall"), n2 = ref({}), s2 = ref([]), h2 = () => {
    const m2 = Math.floor((a.value.getBoundingClientRect().width + l.gap) / (l.columnWidth + l.gap));
    return m2 > 0 ? m2 : 1;
  }, c2 = (m2) => new Array(m2).fill(null).map(() => []), f2 = async (m2) => {
    var R2;
    if (m2 >= l.items.length) return;
    await nextTick();
    const j2 = Array.from(((R2 = a.value) == null ? void 0 : R2.children) ?? []).reduce((E, $2) => $2.getBoundingClientRect().height < E.getBoundingClientRect().height ? $2 : E);
    s2.value[Number(j2.dataset.index)].push(m2), await f2(m2 + 1);
  }, v2 = async (m2 = false) => {
    if (s2.value.length === h2() && !m2) return;
    s2.value = c2(h2());
    const R2 = window.scrollY;
    await f2(0), window.scrollTo({ top: R2 });
  }, y2 = (m2) => {
    n2.value[m2.target.src] = true;
  };
  return onMounted(() => {
    v2(true), t2 = new ResizeObserver(() => {
      v2();
    }), t2.observe(a.value), watch(() => [l.items], () => {
      n2.value = {}, v2(true);
    }), watch(() => [l.columnWidth, l.gap], () => {
      v2();
    });
  }), onBeforeUnmount(() => {
    t2.unobserve(a.value);
  }), (m2, R2) => (openBlock(), createElementBlock("div", { ref_key: "wall", ref: a, class: "wl-gallery", style: normalizeStyle({ gap: `${m2.gap}px` }) }, [(openBlock(true), createElementBlock(Fragment, null, renderList(s2.value, (j2, E) => (openBlock(), createElementBlock("div", { key: E, class: "wl-gallery-column", "data-index": E, style: normalizeStyle({ gap: `${m2.gap}px` }) }, [(openBlock(true), createElementBlock(Fragment, null, renderList(j2, ($2) => (openBlock(), createElementBlock(Fragment, { key: $2 }, [n2.value[m2.items[$2].src] ? createCommentVNode("v-if", true) : (openBlock(), createBlock(unref(ue), { key: 0, size: 36, style: { margin: "20px auto" } })), createBaseVNode("img", { class: "wl-gallery-item", src: m2.items[$2].src, title: m2.items[$2].title, loading: "lazy", onLoad: y2, onClick: (S) => m2.$emit("insert", `![](${m2.items[$2].src})`) }, null, 40, cl)], 64))), 128))], 12, sl))), 128))], 4));
} });
var ml = { key: 0, class: "wl-login-info" };
var vl = { class: "wl-avatar" };
var dl = ["title"];
var pl = ["title"];
var gl = ["src"];
var hl = ["title", "textContent"];
var fl = { class: "wl-panel" };
var wl = ["for", "textContent"];
var yl = ["id", "onUpdate:modelValue", "name", "type"];
var bl = ["placeholder"];
var kl = { class: "wl-preview" };
var Cl = ["innerHTML"];
var $l = { class: "wl-footer" };
var Ll = { class: "wl-actions" };
var El = { href: "https://guides.github.com/features/mastering-markdown/", title: "Markdown Guide", "aria-label": "Markdown is supported", class: "wl-action", target: "_blank", rel: "noopener noreferrer" };
var Il = ["title"];
var Al = ["title"];
var Ml = ["title", "aria-label"];
var xl = ["title"];
var Rl = { class: "wl-info" };
var Sl = { class: "wl-text-number" };
var jl = { key: 0 };
var Ul = ["textContent"];
var zl = ["textContent"];
var Vl = ["disabled"];
var _l = ["placeholder"];
var Hl = { key: 1, class: "wl-loading" };
var Tl = { key: 0, class: "wl-tab-wrapper" };
var Fl = ["title", "onClick"];
var Nl = ["src", "alt"];
var Wl = { key: 0, class: "wl-tabs" };
var Bl = ["onClick"];
var Dl = ["src", "alt", "title"];
var Pl = ["title"];
var gt = defineComponent({ __name: "CommentBox", props: { edit: {}, rootId: {}, replyId: {}, replyUser: {} }, emits: ["log", "cancelEdit", "cancelReply", "submit"], setup(e2, { emit: l }) {
  const t2 = e2, a = l, n2 = inject(we), s2 = Da(), h2 = Ba(), c2 = be(), f2 = ref({}), v2 = useTemplateRef("textarea"), y2 = useTemplateRef("image-uploader"), m2 = useTemplateRef("emoji-button"), R2 = useTemplateRef("emoji-popup"), j2 = useTemplateRef("gif-button"), E = useTemplateRef("gif-popup"), $2 = useTemplateRef("gif-search"), S = ref({ tabs: [], map: {} }), i = ref(0), g = ref(false), K = ref(false), X = ref(false), A = ref(""), V = ref(0), T = reactive({ loading: true, list: [] }), le = ref(0), Q = ref(false), me = ref(""), w2 = ref(false), U2 = ref(false), b = computed(() => n2.value.locale), F = computed(() => !!c2.value.token), q = computed(() => isDef(n2.value.imageUploader)), O = (d2) => {
    const r2 = v2.value, C2 = r2.selectionStart, H = r2.selectionEnd || 0, k = r2.scrollTop;
    s2.value = r2.value.substring(0, C2) + d2 + r2.value.substring(H, r2.value.length), r2.focus(), r2.selectionStart = C2 + d2.length, r2.selectionEnd = C2 + d2.length, r2.scrollTop = k;
  }, ie = ({ key: d2, ctrlKey: r2, metaKey: C2 }) => {
    w2.value || (r2 || C2) && d2 === "Enter" && Se();
  }, ve = async (d2) => {
    const r2 = `![${n2.value.locale.uploading} ${d2.name}]()`;
    O(r2), w2.value = true;
    try {
      const C2 = await n2.value.imageUploader(d2);
      s2.value = s2.value.replace(r2, `\r
![${d2.name}](${C2})`);
    } catch (C2) {
      alert(C2.message), s2.value = s2.value.replace(r2, "");
    } finally {
      w2.value = false;
    }
  }, ke = (d2) => {
    var r2;
    if ((r2 = d2.dataTransfer) != null && r2.items) {
      const C2 = ct(d2.dataTransfer.items);
      C2 && q.value && (ve(C2), d2.preventDefault());
    }
  }, yt = (d2) => {
    if (d2.clipboardData) {
      const r2 = ct(d2.clipboardData.items);
      r2 && q.value && ve(r2);
    }
  }, bt = () => {
    const d2 = y2.value;
    d2.files && q.value && ve(d2.files[0]).then(() => {
      d2.value = "";
    });
  }, Se = async () => {
    var d2;
    const { serverURL: r2, lang: C2, login: H, wordLimit: k, requiredMeta: D, recaptchaV3Key: N, turnstileKey: Y } = n2.value, _ = { comment: me.value, nick: h2.value.nick, mail: h2.value.mail, link: h2.value.link, url: n2.value.path, ua: await Sa() };
    if (!t2.edit) if (c2.value.token) _.nick = c2.value.display_name, _.mail = c2.value.email, _.link = c2.value.url;
    else {
      if (H === "force") return;
      if (D.includes("nick") && !_.nick) {
        f2.value.nick.focus(), alert(b.value.nickError);
        return;
      }
      if (D.includes("mail") && !_.mail || _.mail && !fa(_.mail)) {
        f2.value.mail.focus(), alert(b.value.mailError);
        return;
      }
      _.nick || (_.nick = b.value.anonymous);
    }
    if (!_.comment) {
      v2.value.focus();
      return;
    }
    if (!Q.value) {
      alert(b.value.wordHint.replace("$0", k[0].toString()).replace("$1", k[1].toString()).replace("$2", V.value.toString()));
      return;
    }
    _.comment = ut(_.comment, S.value.map), t2.replyId && t2.rootId && (_.pid = t2.replyId, _.rid = t2.rootId, _.at = t2.replyUser), w2.value = true;
    try {
      N && (_.recaptchaV3 = await Za(N).execute("social")), Y && (_.turnstile = await Xa(Y).execute("social"));
      const de = { serverURL: r2, lang: C2, token: c2.value.token, comment: _ }, Ce = await (t2.edit ? U({ objectId: t2.edit.objectId, ...de }) : u(de));
      if (w2.value = false, Ce.errmsg) {
        alert(Ce.errmsg);
        return;
      }
      a("submit", Ce.data), s2.value = "", A.value = "", await nextTick(), t2.replyId && a("cancelReply"), (d2 = t2.edit) != null && d2.objectId && a("cancelEdit");
    } catch (de) {
      w2.value = false, alert(de.message);
    }
  }, kt = (d2) => {
    d2.preventDefault();
    const { lang: r2, serverURL: C2 } = n2.value;
    R({ serverURL: C2, lang: r2 }).then((H) => {
      c2.value = H, (H.remember ? localStorage : sessionStorage).setItem("WALINE_USER", JSON.stringify(H)), a("log");
    });
  }, Ct = () => {
    c2.value = {}, localStorage.setItem("WALINE_USER", "null"), sessionStorage.setItem("WALINE_USER", "null"), a("log");
  }, je = (d2) => {
    d2.preventDefault();
    const { lang: r2, serverURL: C2 } = n2.value, H = 800, k = 800, D = (window.innerWidth - H) / 2, N = (window.innerHeight - k) / 2, Y = new URLSearchParams({ lng: r2, token: c2.value.token }), _ = window.open(`${C2}/ui/profile?${Y.toString()}`, "_blank", `width=${H},height=${k},left=${D},top=${N},scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no`);
    _ == null || _.postMessage({ type: "TOKEN", data: c2.value.token }, "*");
  }, $t = (d2) => {
    var r2, C2, H, k;
    !((r2 = m2.value) != null && r2.contains(d2.target)) && !((C2 = R2.value) != null && C2.contains(d2.target)) && (g.value = false), !((H = j2.value) != null && H.contains(d2.target)) && !((k = E.value) != null && k.contains(d2.target)) && (K.value = false);
  }, Ue = async (d2) => {
    var r2;
    const { scrollTop: C2, clientHeight: H, scrollHeight: k } = d2.target, D = (H + C2) / k, N = n2.value.search, Y = ((r2 = $2.value) == null ? void 0 : r2.value) ?? "";
    D < 0.9 || T.loading || U2.value || (T.loading = true, (N.more && T.list.length ? await N.more(Y, T.list.length) : await N.search(Y)).length ? T.list = [...T.list, ...N.more && T.list.length ? await N.more(Y, T.list.length) : await N.search(Y)] : U2.value = true, T.loading = false, setTimeout(() => {
      d2.target.scrollTop = C2;
    }, 50));
  }, ze = useDebounceFn((d2) => {
    T.list = [], U2.value = false, Ue(d2);
  }, 300);
  return useEventListener("click", $t), useEventListener("message", ({ data: d2 }) => {
    !d2 || d2.type !== "profile" || (c2.value = { ...c2.value, ...d2.data }, [localStorage, sessionStorage].filter((r2) => r2.getItem("WALINE_USER")).forEach((r2) => {
      r2.setItem("WALINE_USER", JSON.stringify(c2));
    }));
  }), watchImmediate([n2, V], ([d2, r2]) => {
    const { wordLimit: C2 } = d2;
    C2 ? r2 < C2[0] && C2[0] !== 0 ? (le.value = C2[0], Q.value = false) : r2 > C2[1] ? (le.value = C2[1], Q.value = false) : (le.value = C2[1], Q.value = true) : (le.value = 0, Q.value = true);
  }), watch(K, async (d2) => {
    var r2;
    if (!d2) return;
    const C2 = n2.value.search;
    $2.value && ($2.value.value = ""), T.loading = true, T.list = await (((r2 = C2.default) == null ? void 0 : r2.call(C2)) ?? C2.search("")), T.loading = false;
  }), onMounted(() => {
    var d2;
    (d2 = t2.edit) != null && d2.objectId && (s2.value = t2.edit.orig), watchImmediate(() => s2.value, (r2) => {
      const { highlighter: C2, texRenderer: H } = n2.value;
      me.value = r2, A.value = Aa(r2, { emojiMap: S.value.map, highlighter: C2, texRenderer: H }), V.value = Ra(r2), r2 ? autosize_esm_default(v2.value) : autosize_esm_default.destroy(v2.value);
    }), watchImmediate(() => n2.value.emoji, async (r2) => {
      S.value = await ka(r2);
    });
  }), (d2, r2) => {
    var C2, H;
    return openBlock(), createElementBlock("div", { key: unref(c2).token, class: "wl-comment" }, [unref(n2).login !== "disable" && F.value && !((C2 = d2.edit) != null && C2.objectId) ? (openBlock(), createElementBlock("div", ml, [createBaseVNode("div", vl, [createBaseVNode("button", { type: "submit", class: "wl-logout-btn", title: b.value.logout, onClick: Ct }, [createVNode(unref(vt), { size: 14 })], 8, dl), createBaseVNode("a", { href: "#", class: "wl-login-nick", "aria-label": "Profile", title: b.value.profile, onClick: je }, [createBaseVNode("img", { src: unref(c2).avatar, alt: "avatar" }, null, 8, gl)], 8, pl)]), createBaseVNode("a", { href: "#", class: "wl-login-nick", "aria-label": "Profile", title: b.value.profile, onClick: je, textContent: toDisplayString(unref(c2).display_name) }, null, 8, hl)])) : createCommentVNode("v-if", true), createBaseVNode("div", fl, [unref(n2).login !== "force" && unref(n2).meta.length && !F.value ? (openBlock(), createElementBlock("div", { key: 0, class: normalizeClass(["wl-header", `item${unref(n2).meta.length}`]) }, [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(n2).meta, (k) => (openBlock(), createElementBlock("div", { key: k, class: "wl-header-item" }, [createBaseVNode("label", { for: `wl-${k}`, textContent: toDisplayString(b.value[k] + (unref(n2).requiredMeta.includes(k) || !unref(n2).requiredMeta.length ? "" : `(${b.value.optional})`)) }, null, 8, wl), withDirectives(createBaseVNode("input", { id: `wl-${k}`, ref_for: true, ref: (D) => {
      D && (f2.value[k] = D);
    }, "onUpdate:modelValue": (D) => unref(h2)[k] = D, class: normalizeClass(["wl-input", `wl-${k}`]), name: k, type: k === "mail" ? "email" : "text" }, null, 10, yl), [[vModelDynamic, unref(h2)[k]]])]))), 128))], 2)) : createCommentVNode("v-if", true), withDirectives(createBaseVNode("textarea", { id: "wl-edit", ref: "textarea", "onUpdate:modelValue": r2[0] || (r2[0] = (k) => isRef(s2) ? s2.value = k : null), class: "wl-editor", placeholder: d2.replyUser ? `@${d2.replyUser}` : b.value.placeholder, onKeydown: ie, onDrop: ke, onPaste: yt }, null, 40, bl), [[vModelText, unref(s2)]]), withDirectives(createBaseVNode("div", kl, [r2[7] || (r2[7] = createBaseVNode("hr", null, null, -1)), createBaseVNode("h4", null, toDisplayString(b.value.preview) + ":", 1), createBaseVNode("div", { class: "wl-content", innerHTML: A.value }, null, 8, Cl)], 512), [[vShow, X.value]]), createBaseVNode("div", $l, [createBaseVNode("div", Ll, [createBaseVNode("a", El, [createVNode(unref(Ha))]), withDirectives(createBaseVNode("button", { ref: "emoji-button", type: "button", class: normalizeClass(["wl-action", { active: g.value }]), title: b.value.emoji, onClick: r2[1] || (r2[1] = (k) => g.value = !g.value) }, [createVNode(unref(Ua))], 10, Il), [[vShow, S.value.tabs.length]]), unref(n2).search ? (openBlock(), createElementBlock("button", { key: 0, ref: "gif-button", type: "button", class: normalizeClass(["wl-action", { active: K.value }]), title: b.value.gif, onClick: r2[2] || (r2[2] = (k) => K.value = !K.value) }, [createVNode(unref(Wa))], 10, Al)) : createCommentVNode("v-if", true), createBaseVNode("input", { id: "wl-image-upload", ref: "image-uploader", class: "upload", "aria-hidden": "true", type: "file", accept: ".png,.jpg,.jpeg,.webp,.bmp,.gif", onChange: bt }, null, 544), q.value ? (openBlock(), createElementBlock("label", { key: 1, for: "wl-image-upload", class: "wl-action", title: b.value.uploadImage, "aria-label": b.value.uploadImage }, [createVNode(unref(za))], 8, Ml)) : createCommentVNode("v-if", true), createBaseVNode("button", { type: "button", class: normalizeClass(["wl-action", { active: X.value }]), title: b.value.preview, onClick: r2[3] || (r2[3] = (k) => X.value = !X.value) }, [createVNode(unref(_a))], 10, xl)]), createBaseVNode("div", Rl, [r2[9] || (r2[9] = createBaseVNode("div", { class: "wl-captcha-container" }, null, -1)), createBaseVNode("div", Sl, [createTextVNode(toDisplayString(V.value) + " ", 1), unref(n2).wordLimit ? (openBlock(), createElementBlock("span", jl, [r2[8] || (r2[8] = createTextVNode("  /  ")), createBaseVNode("span", { class: normalizeClass({ illegal: !Q.value }), textContent: toDisplayString(le.value) }, null, 10, Ul)])) : createCommentVNode("v-if", true), createTextVNode("  " + toDisplayString(b.value.word), 1)]), unref(n2).login !== "disable" && !F.value ? (openBlock(), createElementBlock("button", { key: 0, type: "button", class: "wl-btn", onClick: kt, textContent: toDisplayString(b.value.login) }, null, 8, zl)) : createCommentVNode("v-if", true), unref(n2).login !== "force" || F.value ? (openBlock(), createElementBlock("button", { key: 1, type: "submit", class: "primary wl-btn", title: "Cmd|Ctrl + Enter", disabled: w2.value, onClick: Se }, [w2.value ? (openBlock(), createBlock(unref(ue), { key: 0, size: 16 })) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [createTextVNode(toDisplayString(b.value.submit), 1)], 64))], 8, Vl)) : createCommentVNode("v-if", true)]), createBaseVNode("div", { ref: "gif-popup", class: normalizeClass(["wl-gif-popup", { display: K.value }]) }, [createBaseVNode("input", { ref: "gif-search", type: "text", placeholder: b.value.gifSearchPlaceholder, onInput: r2[4] || (r2[4] = (...k) => unref(ze) && unref(ze)(...k)) }, null, 40, _l), T.list.length ? (openBlock(), createBlock(ul, { key: 0, items: T.list, "column-width": 200, gap: 6, onInsert: r2[5] || (r2[5] = (k) => O(k)), onScroll: Ue }, null, 8, ["items"])) : createCommentVNode("v-if", true), T.loading ? (openBlock(), createElementBlock("div", Hl, [createVNode(unref(ue), { size: 30 })])) : createCommentVNode("v-if", true)], 2), createBaseVNode("div", { ref: "emoji-popup", class: normalizeClass(["wl-emoji-popup", { display: g.value }]) }, [(openBlock(true), createElementBlock(Fragment, null, renderList(S.value.tabs, (k, D) => (openBlock(), createElementBlock(Fragment, { key: k.name }, [D === i.value ? (openBlock(), createElementBlock("div", Tl, [(openBlock(true), createElementBlock(Fragment, null, renderList(k.items, (N) => (openBlock(), createElementBlock("button", { key: N, type: "button", title: N, onClick: (Y) => O(`:${N}:`) }, [g.value ? (openBlock(), createElementBlock("img", { key: 0, class: "wl-emoji", src: S.value.map[N], alt: N, loading: "lazy", referrerPolicy: "no-referrer" }, null, 8, Nl)) : createCommentVNode("v-if", true)], 8, Fl))), 128))])) : createCommentVNode("v-if", true)], 64))), 128)), S.value.tabs.length > 1 ? (openBlock(), createElementBlock("div", Wl, [(openBlock(true), createElementBlock(Fragment, null, renderList(S.value.tabs, (k, D) => (openBlock(), createElementBlock("button", { key: k.name, type: "button", class: normalizeClass(["wl-tab", { active: i.value === D }]), onClick: (N) => i.value = D }, [createBaseVNode("img", { class: "wl-emoji", src: k.icon, alt: k.name, title: k.name, loading: "lazy", referrerPolicy: "no-referrer" }, null, 8, Dl)], 10, Bl))), 128))])) : createCommentVNode("v-if", true)], 2)])]), d2.replyId || (H = d2.edit) != null && H.objectId ? (openBlock(), createElementBlock("button", { key: 1, type: "button", class: "wl-close", title: b.value.cancelReply, onClick: r2[6] || (r2[6] = (k) => d2.replyId ? a("cancelReply") : a("cancelEdit")) }, [createVNode(unref(vt), { size: 24 })], 8, Pl)) : createCommentVNode("v-if", true)]);
  };
} });
var ql = ["id"];
var Ol = { class: "wl-user", "aria-hidden": "true" };
var Gl = ["src"];
var Kl = { class: "wl-card" };
var Zl = { class: "wl-head" };
var Xl = ["href"];
var Yl = { key: 1, class: "wl-nick" };
var Jl = ["textContent"];
var Ql = ["textContent"];
var en = ["textContent"];
var tn = ["textContent"];
var an = ["textContent"];
var ln = { class: "wl-comment-actions" };
var nn = ["title"];
var rn = ["title"];
var on = { class: "wl-meta", "aria-hidden": "true" };
var sn = ["data-value", "textContent"];
var cn = { key: 0, class: "wl-content" };
var un = { key: 0 };
var mn = ["href"];
var vn = ["innerHTML"];
var dn = { key: 1, class: "wl-admin-actions" };
var pn = { class: "wl-comment-status" };
var gn = ["disabled", "onClick", "textContent"];
var hn = { key: 3, class: "wl-quote" };
var fn = defineComponent({ __name: "CommentCard", props: { comment: {}, edit: {}, rootId: {}, reply: {} }, emits: ["log", "submit", "delete", "like", "sticky", "edit", "reply", "status"], setup(e2, { emit: l }) {
  const t2 = e2, a = l, n2 = ["approved", "waiting", "spam"], s2 = inject(we), h2 = dt(), c2 = useNow(), f2 = be(), v2 = computed(() => s2.value.locale), y2 = computed(() => {
    const { link: i } = t2.comment;
    return i ? rt(i) ? i : `https://${i}` : "";
  }), m2 = computed(() => h2.value.includes(t2.comment.objectId)), R2 = computed(() => ga(new Date(t2.comment.time), c2.value, v2.value)), j2 = computed(() => f2.value.type === "administrator"), E = computed(() => t2.comment.user_id && f2.value.objectId === t2.comment.user_id), $2 = computed(() => {
    var i;
    return t2.comment.objectId === ((i = t2.reply) == null ? void 0 : i.objectId);
  }), S = computed(() => {
    var i;
    return t2.comment.objectId === ((i = t2.edit) == null ? void 0 : i.objectId);
  });
  return (i, g) => {
    var K;
    const X = resolveComponent("CommentCard", true);
    return openBlock(), createElementBlock("div", { id: i.comment.objectId.toString(), class: "wl-card-item" }, [createBaseVNode("div", Ol, [i.comment.avatar ? (openBlock(), createElementBlock("img", { key: 0, class: "wl-user-avatar", src: i.comment.avatar, alt: "" }, null, 8, Gl)) : createCommentVNode("v-if", true), i.comment.type ? (openBlock(), createBlock(unref(Na), { key: 1 })) : createCommentVNode("v-if", true)]), createBaseVNode("div", Kl, [createBaseVNode("div", Zl, [y2.value ? (openBlock(), createElementBlock("a", { key: 0, class: "wl-nick", href: y2.value, target: "_blank", rel: "nofollow noopener noreferrer" }, toDisplayString(i.comment.nick), 9, Xl)) : (openBlock(), createElementBlock("span", Yl, toDisplayString(i.comment.nick), 1)), i.comment.type === "administrator" ? (openBlock(), createElementBlock("span", { key: 2, class: "wl-badge", textContent: toDisplayString(v2.value.admin) }, null, 8, Jl)) : createCommentVNode("v-if", true), i.comment.label ? (openBlock(), createElementBlock("span", { key: 3, class: "wl-badge", textContent: toDisplayString(i.comment.label) }, null, 8, Ql)) : createCommentVNode("v-if", true), i.comment.sticky ? (openBlock(), createElementBlock("span", { key: 4, class: "wl-badge", textContent: toDisplayString(v2.value.sticky) }, null, 8, en)) : createCommentVNode("v-if", true), typeof i.comment.level == "number" ? (openBlock(), createElementBlock("span", { key: 5, class: normalizeClass(`wl-badge level${i.comment.level}`), textContent: toDisplayString(v2.value[`level${i.comment.level}`] || `Level ${i.comment.level}`) }, null, 10, tn)) : createCommentVNode("v-if", true), createBaseVNode("span", { class: "wl-time", textContent: toDisplayString(R2.value) }, null, 8, an), createBaseVNode("div", ln, [j2.value || E.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [createBaseVNode("button", { type: "button", class: "wl-edit", onClick: g[0] || (g[0] = (A) => a("edit", i.comment)) }, [createVNode(unref(Fa))]), createBaseVNode("button", { type: "button", class: "wl-delete", onClick: g[1] || (g[1] = (A) => a("delete", i.comment)) }, [createVNode(unref(ja))])], 64)) : createCommentVNode("v-if", true), createBaseVNode("button", { type: "button", class: "wl-like", title: m2.value ? v2.value.cancelLike : v2.value.like, onClick: g[2] || (g[2] = (A) => a("like", i.comment)) }, [createVNode(unref(Va), { active: m2.value }, null, 8, ["active"]), createTextVNode(" " + toDisplayString("like" in i.comment ? i.comment.like : ""), 1)], 8, nn), createBaseVNode("button", { type: "button", class: normalizeClass(["wl-reply", { active: $2.value }]), title: $2.value ? v2.value.cancelReply : v2.value.reply, onClick: g[3] || (g[3] = (A) => a("reply", $2.value ? null : i.comment)) }, [createVNode(unref(Ta))], 10, rn)])]), createBaseVNode("div", on, [(openBlock(), createElementBlock(Fragment, null, renderList(["addr", "browser", "os"], (A) => (openBlock(), createElementBlock(Fragment, null, [i.comment[A] ? (openBlock(), createElementBlock("span", { key: A, class: normalizeClass(`wl-${A}`), "data-value": i.comment[A], textContent: toDisplayString(i.comment[A]) }, null, 10, sn)) : createCommentVNode("v-if", true)], 64))), 64))]), S.value ? createCommentVNode("v-if", true) : (openBlock(), createElementBlock("div", cn, ["reply_user" in i.comment && i.comment.reply_user ? (openBlock(), createElementBlock("p", un, [createBaseVNode("a", { href: "#" + i.comment.pid }, "@" + toDisplayString(i.comment.reply_user.nick), 9, mn), g[17] || (g[17] = createBaseVNode("span", null, ": ", -1))])) : createCommentVNode("v-if", true), createBaseVNode("div", { innerHTML: i.comment.comment }, null, 8, vn)])), j2.value && !S.value ? (openBlock(), createElementBlock("div", dn, [createBaseVNode("span", pn, [(openBlock(), createElementBlock(Fragment, null, renderList(n2, (A) => createBaseVNode("button", { key: A, type: "submit", class: normalizeClass(`wl-btn wl-${A}`), disabled: i.comment.status === A, onClick: (V) => a("status", { status: A, comment: i.comment }), textContent: toDisplayString(v2.value[A]) }, null, 10, gn)), 64))]), j2.value && !("rid" in i.comment) ? (openBlock(), createElementBlock("button", { key: 0, type: "submit", class: "wl-btn wl-sticky", onClick: g[4] || (g[4] = (A) => a("sticky", i.comment)) }, toDisplayString(i.comment.sticky ? v2.value.unsticky : v2.value.sticky), 1)) : createCommentVNode("v-if", true)])) : createCommentVNode("v-if", true), $2.value || S.value ? (openBlock(), createElementBlock("div", { key: 2, class: normalizeClass({ "wl-reply-wrapper": $2.value, "wl-edit-wrapper": S.value }) }, [createVNode(gt, { edit: i.edit, "reply-id": (K = i.reply) == null ? void 0 : K.objectId, "reply-user": i.comment.nick, "root-id": i.rootId, onLog: g[5] || (g[5] = (A) => a("log")), onCancelReply: g[6] || (g[6] = (A) => a("reply", null)), onCancelEdit: g[7] || (g[7] = (A) => a("edit", null)), onSubmit: g[8] || (g[8] = (A) => a("submit", A)) }, null, 8, ["edit", "reply-id", "reply-user", "root-id"])], 2)) : createCommentVNode("v-if", true), "children" in i.comment ? (openBlock(), createElementBlock("div", hn, [(openBlock(true), createElementBlock(Fragment, null, renderList(i.comment.children, (A) => (openBlock(), createBlock(X, { key: A.objectId, comment: A, reply: i.reply, edit: i.edit, "root-id": i.rootId, onLog: g[9] || (g[9] = (V) => a("log")), onDelete: g[10] || (g[10] = (V) => a("delete", V)), onEdit: g[11] || (g[11] = (V) => a("edit", V)), onLike: g[12] || (g[12] = (V) => a("like", V)), onReply: g[13] || (g[13] = (V) => a("reply", V)), onStatus: g[14] || (g[14] = (V) => a("status", V)), onSticky: g[15] || (g[15] = (V) => a("sticky", V)), onSubmit: g[16] || (g[16] = (V) => a("submit", V)) }, null, 8, ["comment", "reply", "edit", "root-id"]))), 128))])) : createCommentVNode("v-if", true)])], 8, ql);
  };
} });
var ht = "3.5.6";
var wn = { "data-waline": "" };
var yn = { class: "wl-meta-head" };
var bn = { class: "wl-count" };
var kn = ["textContent"];
var Cn = { class: "wl-sort" };
var $n = ["onClick"];
var Ln = { class: "wl-cards" };
var En = { key: 1, class: "wl-operation" };
var In = ["textContent"];
var An = { key: 2, class: "wl-loading" };
var Mn = ["textContent"];
var xn = { key: 4, class: "wl-operation" };
var Rn = ["textContent"];
var Sn = { key: 5, class: "wl-power" };
var jn = defineComponent({ __name: "WalineComment", props: { serverURL: {}, path: {}, meta: {}, requiredMeta: {}, wordLimit: {}, pageSize: {}, lang: {}, locale: {}, commentSorting: {}, dark: { type: [String, Boolean] }, login: {}, noCopyright: { type: Boolean }, recaptchaV3Key: {}, turnstileKey: {}, reaction: {}, emoji: {}, search: {}, highlighter: { type: Function }, imageUploader: { type: Function }, texRenderer: { type: Function } }, setup(e2) {
  const l = e2, t2 = be(), a = dt(), n2 = ref("loading"), s2 = ref(0), h2 = ref(1), c2 = ref(0), f2 = computed(() => va(l)), v2 = ref(f2.value.commentSorting), y2 = ref([]), m2 = ref(null), R2 = ref(null), j2 = computed(() => da(f2.value.dark)), E = computed(() => f2.value.locale);
  useStyleTag(j2, { id: "waline-darkmode" });
  let $2 = null;
  const S = (w2) => {
    const { serverURL: U2, path: b, pageSize: F } = f2.value, q = new AbortController();
    n2.value = "loading", $2 == null || $2(), $({ serverURL: U2, lang: f2.value.lang, path: b, pageSize: F, sortBy: at[v2.value], page: w2, signal: q.signal, token: t2.value.token }).then((O) => {
      n2.value = "success", s2.value = O.count, y2.value.push(...O.data), h2.value = w2, c2.value = O.totalPages;
    }).catch((O) => {
      O.name !== "AbortError" && (console.error(O.message), n2.value = "error");
    }), $2 = q.abort.bind(q);
  }, i = () => {
    S(h2.value + 1);
  }, g = () => {
    s2.value = 0, y2.value = [], S(1);
  }, K = (w2) => {
    v2.value !== w2 && (v2.value = w2, g());
  }, X = (w2) => {
    m2.value = w2;
  }, A = (w2) => {
    R2.value = w2;
  }, V = (w2) => {
    if (R2.value) R2.value.comment = w2.comment, R2.value.orig = w2.orig;
    else if ("rid" in w2) {
      const U2 = y2.value.find(({ objectId: b }) => b === w2.rid);
      if (!U2) return;
      Array.isArray(U2.children) || (U2.children = []), U2.children.push(w2);
    } else y2.value.unshift(w2), s2.value += 1;
  }, T = async ({ comment: w2, status: U2 }) => {
    if (w2.status === U2) return;
    const { serverURL: b, lang: F } = f2.value;
    await U({ serverURL: b, lang: F, token: t2.value.token, objectId: w2.objectId, comment: { status: U2 } }), w2.status = U2;
  }, le = async (w2) => {
    if ("rid" in w2) return;
    const { serverURL: U2, lang: b } = f2.value;
    await U({ serverURL: U2, lang: b, token: t2.value.token, objectId: w2.objectId, comment: { sticky: w2.sticky ? 0 : 1 } }), w2.sticky = !w2.sticky;
  }, Q = async ({ objectId: w2 }) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    const { serverURL: U2, lang: b } = f2.value;
    await y({ serverURL: U2, lang: b, token: t2.value.token, objectId: w2 }), y2.value.some((F, q) => F.objectId === w2 ? (y2.value = y2.value.filter((O, ie) => ie !== q), true) : F.children.some((O, ie) => O.objectId === w2 ? (y2.value[q].children = F.children.filter((ve, ke) => ke !== ie), true) : false));
  }, me = async (w2) => {
    const { serverURL: U2, lang: b } = f2.value, { objectId: F } = w2, q = a.value.includes(F);
    await U({ serverURL: U2, lang: b, objectId: F, token: t2.value.token, comment: { like: !q } }), q ? a.value = a.value.filter((O) => O !== F) : (a.value = [...a.value, F], a.value.length > 50 && (a.value = a.value.slice(-50))), w2.like = Math.max(0, (w2.like || 0) + (q ? -1 : 1));
  };
  return provide(we, f2), onMounted(() => {
    watchImmediate(() => [l.serverURL, l.path], () => {
      g();
    });
  }), onUnmounted(() => {
    $2 == null || $2();
  }), (w2, U2) => (openBlock(), createElementBlock("div", wn, [createVNode(il), !m2.value && !R2.value ? (openBlock(), createBlock(gt, { key: 0, onLog: g, onSubmit: V })) : createCommentVNode("v-if", true), createBaseVNode("div", yn, [createBaseVNode("div", bn, [s2.value ? (openBlock(), createElementBlock("span", { key: 0, class: "wl-num", textContent: toDisplayString(s2.value) }, null, 8, kn)) : createCommentVNode("v-if", true), createTextVNode(" " + toDisplayString(E.value.comment), 1)]), createBaseVNode("ul", Cn, [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(ua), (b) => (openBlock(), createElementBlock("li", { key: b, class: normalizeClass([b === v2.value ? "active" : ""]), onClick: (F) => K(b) }, toDisplayString(E.value[b]), 11, $n))), 128))])]), createBaseVNode("div", Ln, [(openBlock(true), createElementBlock(Fragment, null, renderList(y2.value, (b) => (openBlock(), createBlock(fn, { key: b.objectId, "root-id": b.objectId, comment: b, reply: m2.value, edit: R2.value, onLog: g, onReply: X, onEdit: A, onSubmit: V, onStatus: T, onDelete: Q, onSticky: le, onLike: me }, null, 8, ["root-id", "comment", "reply", "edit"]))), 128))]), n2.value === "error" ? (openBlock(), createElementBlock("div", En, [createBaseVNode("button", { type: "button", class: "wl-btn", onClick: g, textContent: toDisplayString(E.value.refresh) }, null, 8, In)])) : n2.value === "loading" ? (openBlock(), createElementBlock("div", An, [createVNode(unref(ue), { size: 30 })])) : y2.value.length ? h2.value < c2.value ? (openBlock(), createElementBlock("div", xn, [createBaseVNode("button", { type: "button", class: "wl-btn", onClick: i, textContent: toDisplayString(E.value.more) }, null, 8, Rn)])) : createCommentVNode("v-if", true) : (openBlock(), createElementBlock("div", { key: 3, class: "wl-empty", textContent: toDisplayString(E.value.sofa) }, null, 8, Mn)), f2.value.noCopyright ? createCommentVNode("v-if", true) : (openBlock(), createElementBlock("div", Sn, [U2[0] || (U2[0] = createTextVNode(" Powered by ")), U2[1] || (U2[1] = createBaseVNode("a", { href: "https://github.com/walinejs/waline", target: "_blank", rel: "noopener noreferrer" }, " Waline ", -1)), createTextVNode(" v" + toDisplayString(unref(ht)), 1)]))]));
} });
var ft = (e2, l) => {
  l.forEach((t2, a) => {
    const n2 = e2[a].time;
    typeof n2 == "number" && (t2.innerText = n2.toString());
  });
};
var wt = ({ serverURL: e2, path: l = window.location.pathname, selector: t2 = ".waline-pageview-count", update: a = true, lang: n2 = navigator.language }) => {
  const s2 = new AbortController(), h2 = Array.from(document.querySelectorAll(t2)), c2 = (v2) => {
    const y2 = Re(v2);
    return y2 !== null && l !== y2;
  }, f2 = (v2) => j({ serverURL: ye(e2), paths: v2.map((y2) => Re(y2) ?? l), lang: n2, signal: s2.signal }).then((y2) => ft(y2, v2)).catch(st);
  if (a) {
    const v2 = h2.filter((m2) => !c2(m2)), y2 = h2.filter(c2);
    v({ serverURL: ye(e2), path: l, lang: n2 }).then((m2) => ft(m2, v2)), y2.length && f2(y2);
  } else f2(h2);
  return s2.abort.bind(s2);
};
var Un = ({ el: e2 = "#waline", path: l = window.location.pathname, comment: t2 = false, pageview: a = false, ...n2 }) => {
  const s2 = e2 ? xe(e2) : null;
  if (e2 && !s2) throw new Error("Option 'el' do not match any domElement!");
  if (!n2.serverURL) throw new Error("Option 'serverURL' is missing!");
  const h2 = reactive({ ...n2 }), c2 = reactive({ comment: t2, pageview: a, path: l }), f2 = () => {
    c2.comment && mt({ serverURL: h2.serverURL, path: c2.path, ...oe(c2.comment) ? { selector: c2.comment } : {} });
  }, v2 = () => {
    c2.pageview && wt({ serverURL: h2.serverURL, path: c2.path, ...oe(c2.pageview) ? { selector: c2.pageview } : {} });
  };
  let y2 = null;
  s2 && (y2 = createApp(() => h(jn, { path: c2.path, ...h2 })), y2.mount(s2));
  const m2 = watchEffect(f2), R2 = watchEffect(v2);
  return { el: s2, update: ({ comment: j2, pageview: E, path: $2 = window.location.pathname, ...S } = {}) => {
    Object.entries(S).forEach(([i, g]) => {
      h2[i] = g;
    }), c2.path = $2, j2 !== void 0 && (c2.comment = j2), E !== void 0 && (c2.pageview = E);
  }, destroy: () => {
    y2 == null || y2.unmount(), m2(), R2();
  } };
};

// node_modules/.pnpm/vitepress-theme-website@1.0.8/node_modules/vitepress-theme-website/dist/waline/components/Waline.mjs
import "D:/code/blog/node_modules/.pnpm/@waline+client@3.5.6/node_modules/@waline/client/dist/waline.css";
var WalineComponent = defineComponent({
  name: "WalineComment",
  props: {
    walineOptions: { type: Object, default: () => ({}) }
  },
  setup(props) {
    const walineRef = ref();
    onMounted(() => {
      Un({
        el: "#waline",
        serverURL: props.walineOptions.serverURL,
        login: props.walineOptions.login || "force"
      });
    });
    return () => h("div", { id: "waline", ref: (el2) => walineRef.value = el2 });
  }
});
WalineComponent.newInstance = (props) => {
  const { selector = ".VPDoc .content-container" } = props.walineOptions;
  const container = document.createElement("div");
  container.classList.add("waline-wrap");
  container.style.paddingTop = "48px";
  const parent = document.querySelector(selector);
  if (!parent)
    return;
  parent.appendChild(container);
  const app = createApp({
    render() {
      return h(WalineComponent, {
        ...props
      });
    }
  });
  app.mount(container);
  return {
    destroy() {
      app.unmount();
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }
  };
};
var Waline_default = WalineComponent;

// node_modules/.pnpm/vitepress-theme-website@1.0.8/node_modules/vitepress-theme-website/dist/waline/index.mjs
var useWaline = (walineOptions) => {
  let waline;
  const route = useRoute();
  onMounted(() => {
    updateWaline();
  });
  onBeforeUnmount(() => waline == null ? void 0 : waline.destroy());
  function updateWaline() {
    if (waline) {
      waline == null ? void 0 : waline.destroy();
    }
    setTimeout(() => {
      if (!document)
        return;
      waline = Waline_default.newInstance({ walineOptions });
    }, 500);
  }
  watch(() => route.path, updateWaline);
};

// node_modules/.pnpm/vitepress-theme-website@1.0.8/node_modules/vitepress-theme-website/dist/live2d/components/live2d.mjs
import Live2d from "D:/code/blog/node_modules/.pnpm/vitepress-theme-website@1.0.8/node_modules/vitepress-theme-website/dist/live2d/components/Live2dComponent.vue";
Live2d.init = (props) => {
  const container = document.createElement("div");
  container.classList.add("live2d-wrap");
  const parent = document.querySelector("#app");
  if (!parent)
    return;
  parent.appendChild(container);
  const app = createApp({
    render() {
      return h(Live2d, {
        ...props
      });
    }
  });
  app.mount(container);
  return {
    destroy() {
      app.unmount();
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }
  };
};
var live2d_default = Live2d;

// node_modules/.pnpm/vitepress-theme-website@1.0.8/node_modules/vitepress-theme-website/dist/live2d/index.mjs
import { useRoute as useRoute2 } from "vitepress";
var defaultLive2dOptions = {
  enable: true,
  model: {
    url: "https://raw.githubusercontent.com/iCharlesZ/vscode-live2d-models/master/model-library/hibiki/hibiki.model.json"
  },
  display: {
    position: "right",
    width: "135px",
    height: "300px",
    xOffset: "35px",
    yOffset: "5px"
  },
  mobile: {
    show: true
  },
  react: {
    opacity: 0.8
  }
};
var useLive2d = (live2dOptions = {}) => {
  let live2d;
  const route = useRoute2();
  onMounted(() => {
    init();
  });
  onBeforeUnmount(() => live2d == null ? void 0 : live2d.destroy());
  function init() {
    if (live2d)
      return;
    setTimeout(() => {
      if (!document)
        return;
      live2d = live2d_default.init({ live2dOptions: { ...defaultLive2dOptions, ...live2dOptions } });
    }, 500);
  }
  watch(() => route.path, init);
};
export {
  useLive2d,
  useWaline
};
//# sourceMappingURL=vitepress-theme-website.js.map
