import { toRaw } from "../utils/utils.js"
import { ProxyType } from "../operations/index.js"
import { trigger, track } from "./effect.js"
import { ITERATE_KEY } from "./effect.js"
import { ReactiveFlags } from "../operations/index.js"
import { readonly, reactive } from "./reactive.js"

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
function forEach(callback) {
  let target = toRaw(this)
  track(target, ITERATE_KEY)
  target.forEach(callback)
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
