import { isRef } from "../utils/utils.js"
import { reactive } from "./reactive.js"


/* 源码实现 */
class RefImpl {
  constructor(value) {
    this._value = value
  }

  get value() {
    return this._value
  }

}


/* vue设计原理实现 */
export function ref(val) {
  let wrapper = {
    value: val
  }

  Object.defineProperty(wrapper, '__v_isRef', {
    value: true
  })

  return reactive(wrapper)
}

/* 将响应对象下的key变成响应 */
export function toRef(obj, key) {
  let wrapper = {
    get value() {
      return obj[key]
    },
    set value(val) {
      obj[key] = val
    }
  }
  Object.defineProperty(wrapper, '__v_isRef', {
    value: true
  })
  return wrapper
}

/* 批量实现响应对象的响应 */
export function toRefs(obj) {

  let ret = {}
  for (const key in obj) {
    ret[key] = toRef(obj, key)
  }
  return ret
}


const shallowUnwrapHandlers = {
  get: (target, key, receiver) => unref(Reflect.get(target, key, receiver)),
  set: (target, key, value, receiver) => {
    const oldValue = target[key]
    if (isRef(oldValue) && !isRef(value)) {
      oldValue.value = value
      return true
    } else {
      return Reflect.set(target, key, value, receiver)
    }
  }
}

/* 脱ref 也就是让ref可以不用.value  */
export function proxyRefs(target) {
  return new Proxy(target, shallowUnwrapHandlers)
}



export function unref(ref) {
  return isRef(ref) ? ref.value : ref
}



