import {
  track,
  trigger,
  effect,
  ITERATE_KEY
} from './effect.js'
import { extend, isRef } from '../utils/utils.js'
import { reactive, readonly } from './reactive.js'
import { ProxyType, ReactiveFlags } from '../operations/index.js'
import { arrayInstrumentations } from './rewriteArray.js'

let get = createGetter()
let shallowGet = createGetter(true, false)
let readonlyGet = createGetter(false, true)
let set = createSetter()

function createGetter(isShallow = false, isReadonly = false) {
  /* 参数为 对象 key值 当前改变的对象 */
  return function get(target, key, receiver) {

    // 代理对象可以通过 raw 属性访问原始数据
    if (key === ReactiveFlags.RAW) {
      return target
    }

    /* 如果为数组且key为arrayInstrumentations里的重写的数组方法之一返回这个重写的数组方法 */
    if (Array.isArray(target) && arrayInstrumentations.hasOwnProperty(key)) {
      return Reflect.get(arrayInstrumentations, key, receiver)
    }

    // 1 非只读才添加副作用 
    // 2 如果为symbol 表示读取的是迭代器考虑性能问题不建立响应
    if (!isReadonly && typeof key !== 'symbol') {
      // 将副作用函数 activeEffect 添加到存储副作用函数的桶中
      track(target, key)
    }

    const res = Reflect.get(target, key, receiver)


    // 如果是浅响应，则直接返回原始值
    if (isShallow) {

      return res
    }

    // 实现脱ref 如果为ref直接返回.value后的值 源码里跳过了数组和整数的解包
    if (isRef(res)) {
      return res.value
    }


    // 如果是对象递归调用 reactive 代理子对象 
    if (typeof res === 'object' && res !== null) {
      return isReadonly ? readonly(res) : reactive(res)
    }

    // 返回属性值
    return res
  }
}

function createSetter(isReadonly = false) {
  return function set(target, key, newVal, receiver) {

    if (isReadonly) {
      console.warn(`属性${key}是只读的`)
      return true
    }

    // 获取旧值
    let oldVal = target[key]

    // 如果不是自身的属性 表示为添加操作
    // 如果是数组 且设置的key 的长度小于数组的长度，表示SET操作，否则为 ADD
    let type = Array.isArray(target) ? Number(key) < target.length ? ProxyType.SET : ProxyType.ADD :
      Object.prototype.hasOwnProperty.call(target, key) ? ProxyType.SET : ProxyType.ADD

    // 执行设置操作
    let res = Reflect.set(target, key, newVal, receiver)

    // 只有当改变的对象(receiver)等于代理对象 才会修改 防止原型修改调用set 导致的副作用执行
    if (target === receiver[ReactiveFlags.RAW]) {
      // 只有当不相等才会执行  后面的全等是防止NaN的情况 因为两个NaN不可能全等
      if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
        // 把副作用函数从桶里取出并执行
        trigger(target, key, type, newVal)
      }
    }

    return res
  }

}

// 使用 apply 拦截函数调用
function apply(target, thisArg, argArray) {
  target.call(thisArg, ...argArray)
}

// 拦截 in 的读取操作( a in b )
function has(target, key) {
  track(target, key)
  return Reflect.has(target, key)
}

// 拦截 for in 的读取操作 原理是for in 会调用 Reflect.ownKeys 操作
function ownKeys(target) {
  /* 判断是否为数组如果是数组使用length 添加依赖响应 否则为对象使用 ITERATE_KEY*/
  track(target, Array.isArray(target) ? 'length' : ITERATE_KEY)
  return Reflect.ownKeys(target)
}


// 拦截属性删除操作
function deleteProperty(target, key) {
  // 判断是否删除的是自身的属性
  const hadKey = Object.prototype.hasOwnProperty.call(target, key)

  // 完成删除操作
  let res = Reflect.deleteProperty(target, key)

  if (res && hadKey) {
    // 只有完成了删除操作和是自身的属性才触发更新操作   
    trigger(target, key, ProxyType.DELETE)
  }
  return res
}


export const mutableHandlers = {
  get,
  set,
  apply,
  has,
  ownKeys,
  deleteProperty
}

export const shallowReactiveHandlers = extend({}, mutableHandlers, {
  get: shallowGet
})


export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key) {
    console.warn(`属性${key}是只读的`)
    return true
  },
  deleteProperty(target, key) {
    console.warn(`属性${key}是只读的`)
    return true
  }
}

