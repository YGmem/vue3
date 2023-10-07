import {
  mutableHandlers,
  shallowReactiveHandlers,
  readonlyHandlers
} from "./proxy.js"

import { toRawType } from "../utils/utils.js"
import { collectionHandlers } from "./proxyMapSet.js"




/* 定义一个map集合存储代理对象 */
let proxyMap = new Map()


/* 复杂类型响应 */
export function reactive(obj) {
  /* 从代理对象集合寻找是否已经存在代理对象，存在就直接返回该代理对象,为了解决代理对象和代理对象不等问题 */
  let res = proxyMap.get(obj)
  if (res) {
    return res
  }
  let proxyObj = createReactive(obj, mutableHandlers, collectionHandlers)
  /* 存储代理对象 */
  proxyMap.set(obj, proxyObj)
  return proxyObj
}

/* 浅响应 */
export function shallowReactive(obj) {
  return createReactive(obj, shallowReactiveHandlers)
}

/* 只读 */
export function readonly(obj) {
  return createReactive(obj, readonlyHandlers)
}


/* 用户存储代理对象的类型 */
const TargetType = {
  INVALID: 0,
  COMMON: 1,
  COLLECTION: 2
}

/* 类型分类 */
function targetTypeMap(rawType) {
  switch (rawType) {
    case 'Object':
    case 'Array':
      return TargetType.COMMON
    case 'Map':
    case 'Set':
    case 'WeakMap':
    case 'WeakSet':
      return TargetType.COLLECTION
    default:
      return TargetType.INVALID
  }
}


/* 创建响应 */
function createReactive(obj, baseHandlers,) {

  /* 判断类型 */
  let targetType = targetTypeMap(toRawType(obj))

  return new Proxy(
    obj,
    targetType === TargetType.COLLECTION ? collectionHandlers : baseHandlers
  )
}