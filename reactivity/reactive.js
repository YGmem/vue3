import {
  mutableHandlers,
  shallowReactiveHandlers,
  readonlyHandlers
} from "./proxy.js"

export function reactive(obj) {
  return createReactive(obj, mutableHandlers)
}


export function shallowReactive(obj) {
  return createReactive(obj, shallowReactiveHandlers)
}

export function readonly(obj) {
  return createReactive(obj, readonlyHandlers)
}


function createReactive(obj, baseHandlers) {
  return new Proxy(obj, baseHandlers)
}