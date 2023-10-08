import { toRaw, isMap } from "../utils/utils.js"
import { ProxyType, ReactiveFlags } from "../operations/index.js"
import { trigger, track } from "./effect.js"
import { ITERATE_KEY } from "./effect.js"
import { readonly, reactive } from "./reactive.js"
import { toReactive } from "./reactive.js"


/* 创建一个keys 单独的Symbol 防止修改values导致的响应 */
export const MAP_KEY_ITERATE_KEY = Symbol()

export let collectionHandlers = {
  get: createInstrumentationGetter()
}


/* map的get */
function get(
  target,
  key,
  isShallow,
  isReadonly
) {

  target = toRaw(target)

  const has = target.has(key)
  let res = target.get(key)
  /* 判断是否存在，收集响应 */
  if (has) {
    track(target, key)
    /* 如果为对象继续代理 */
    if (typeof res === 'object' && res !== null) {
      return isReadonly ? readonly(res) : reactive(res)
    }
  }

  return res
}


/* map和set调用的size */
function size(target) {
  target = toRaw(target)
  track(target, ITERATE_KEY)
  return Reflect.get(target, 'size', target)
}


/* 删除 */
function deleteEntry(value) {
  let target = toRaw(this)

  let hasKey = target.has(value)

  let res = target.delete(value)
  // 如果删除的值存在才响应
  if (hasKey) {
    trigger(target, ITERATE_KEY, ProxyType.DELETE)
  }
  return res

}


/* map的set */
function set(key, value) {
  // 获取原始操作对象
  let target = toRaw(this)

  let has = target.has(key)
  /* 获取旧值 */
  let oldValue = target.get(key)

  /* 取出值的原始对象防止数据污染 :响应式数据设置到原始数据上的行为称为数据污
染  放在操作者可以使用非响应对象获取到响应对象然后实现响应 这种是不应该的*/
  let rawValue = toRaw(value)
  // 设置新值
  target.set(key, rawValue)
  /* 如果不存在为添加操作 */
  if (!has) {
    trigger(target, key, ProxyType.ADD)
  } else if (oldValue !== value && (value === value || oldValue === oldValue)) {
    /* 如果旧值和新值不同为修改操作 */
    trigger(target, key, ProxyType.SET)
  }
}



function has(key) {

}

/* set添加 */
function add(value) {

  let target = toRaw(this)

  let hasKey = target.has(value)

  let res = target.add(value)
  if (!hasKey) {
    trigger(target, ITERATE_KEY, ProxyType.ADD)
  }
  return res
}

/* forEach 响应 */
function forEach(callback, thisArg) {
  // 取得原始数据对象
  let target = toRaw(this)

  // 与 ITERATE_KEY 建立响应联系
  track(target, ITERATE_KEY)
  // 通过原始数据对象调用 forEach 方法，并把 callback 传递过去
  target.forEach((v, k) => {
    callback.call(thisArg, toReactive(v), toReactive(k), this)
  })
}

/* 创建迭代器方法 */
function createIterableMethod(method) {

  return function () {

    // 获取原始对象
    let target = this[ReactiveFlags.RAW]
    let targetIsMap = isMap(target)

    // 调用原始对象的迭代器方法 相当于使用entries
    let itr = target[method]()

    // 是否判断是否为entries 或者为迭代器
    let isPair = method === 'entries' || (method === Symbol.iterator && targetIsMap)

    // 如果为keys 那么修改value没必要更新所以用新的Symbol对象代替
    track(target, method === 'keys' ? MAP_KEY_ITERATE_KEY : ITERATE_KEY)
    return {
      next() {
        // 自己实现一个next方法 已实现深度响应
        let { value, done } = itr.next()

        // 实现迭代出的值的深度响应
        return done
          ? { value, done } :
          {
            // 为entries 或者为迭代器 值为数组第一个值为value 第二个值为key 否则为keys 和values 只有值或者key
            value: isPair ? [toReactive(value[0]), toReactive(value[1])] : toReactive(value)
          }
      },
      // 实现可迭代协议 不然无法使用迭代 for(let key of map.map迭代方法)
      [Symbol.iterator]() {
        return this
      }
    }
  }

}



function createInstrumentations() {

  const mutableInstrumentations = {
    get(key) {
      return get(this, key)
    },
    get size() {
      return size(this)
    },
    delete: deleteEntry,
    has,
    add,
    set,
    forEach
  }


  let iteratorMethods = ['values', 'keys', 'entries', Symbol.iterator]
  iteratorMethods.forEach(methods => {
    mutableInstrumentations[methods] = createIterableMethod(methods)
  })


  return [
    mutableInstrumentations
  ]
}



const [
  mutableInstrumentations
] = /* #__PURE__*/ createInstrumentations()

/* 创建map和set的get */
function createInstrumentationGetter() {


  return (target, key, receiver) => {

    if (key === ReactiveFlags.RAW) {
      return target
    }

    return Reflect.get(
      key in mutableInstrumentations ?
        mutableInstrumentations : target,
      key,
      receiver)
  }
}
