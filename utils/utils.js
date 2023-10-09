import { ReactiveFlags } from "../operations/index.js"

/* 简易继承 */
export const extend = Object.assign


/**
 * @description: 获取原始对象
 * @param {*} target
 */
export function toRaw(target) {
  let res = target && target[ReactiveFlags.RAW]
  return res ? toRaw(res) : target
}


export const objectToString = Object.prototype.toString

export const toTypeString = value =>
  objectToString.call(value)

/* 从字符串[object RawType] 中提取 RawType 对象 */
export const toRawType = value => {
  return toTypeString(value).slice(8, -1)
}


/**
 * @description: 比较值是否已更改，考虑 NaN
 * @param  value
 * @param  oldValue
 */
export const hasChanged = (value, oldValue) =>
  !Object.is(value, oldValue)


/**
 * @description: 是否为对象
 * @param {*} val
 */
export const isObject = (val) =>
  val !== null && typeof val === 'object'



/**
 * @description: 是否为数组
 */
export const isArray = Array.isArray


/**
 * @description: 是否为Map
 * @param {*} val
 */
export const isMap = (val) =>
  toTypeString(val) === '[object Map]'


/**
 * @description: 判断是否为ref
 * @param {*} ref
 */
export const isRef = (ref) => {
  return !!(ref && ref.__v_isRef)
}