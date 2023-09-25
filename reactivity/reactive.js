import {
  mutableHandlers,
  shallowReactiveHandlers,
  readonlyHandlers
} from "./proxy.js"

/* 复杂类型响应 */
export function reactive(obj) {
  return createReactive(obj, mutableHandlers)
}

/* 浅响应 */
export function shallowReactive(obj) {
  return createReactive(obj, shallowReactiveHandlers)
}

/* 只读 */
export function readonly(obj) {
  return createReactive(obj, readonlyHandlers)
}


/* 创建响应 */
function createReactive(obj, baseHandlers) {
  return new Proxy(obj, baseHandlers)
}