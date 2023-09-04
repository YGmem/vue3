import { track, trigger, effect, ITERATE_KEY } from '../effect/index.js'
import { ProxyType } from '../operations/index.js'


export const baseHandlers = {
  get,
  set,
  apply,
  has,
  ownKeys,
  deleteProperty
}

// 拦截读取操作
function get(target, key, receiver) {
  // 将副作用函数 activeEffect 添加到存储副作用函数的桶中
  track(target, key)
  // 返回属性值
  return Reflect.get(target, key, receiver)
}

// 拦截设置操作
function set(target, key, newVal, receiver) {

  // 如果不是自身的属性 表示为添加操作
  let type = Object.prototype.hasOwnProperty.call(target, key) ? ProxyType.SET : ProxyType.ADD

  // 执行设置操作
  let res = Reflect.set(target, key, newVal, receiver)

  // 把副作用函数从桶里取出并执行
  trigger(target, key, type)
  return res
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
  track(target, ITERATE_KEY)
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