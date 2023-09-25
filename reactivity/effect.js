import { ProxyType } from "../operations/index.js"

let activeEffect  // 当前触发的副作用函数
let effectStack = [] // 栈区 防止嵌套副作用 导致的内部副作用函数触发后 外层的触发函数变成内部的 副作用函数
export const ITERATE_KEY = Symbol() // in操作的读取存储的副作用key 用于in 操作的依赖副作用存储 触发


const bucket = new WeakMap() // 桶 搜集全部依赖函数


export function track(target, key) {
  // 没有 activeEffect，直接 return
  if (!activeEffect) return
  let depsMap = bucket.get(target)
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()))
  }
  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, (deps = new Set()))
  }
  // 把当前激活的副作用函数添加到依赖集合 deps 中
  deps.add(activeEffect)
  // deps 就是一个与当前副作用函数存在联系的依赖集合
  // 将其添加到 activeEffect.deps 数组中
  activeEffect.deps.push(deps)
}


export function trigger(target, key, type, newVal) {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)

  const iterateEffects = depsMap.get(ITERATE_KEY)

  const effectsToRun = new Set()
  effects && effects.forEach(effectFn => {
    // 不等于当前执行函数才添加执行
    if (effectFn !== activeEffect) {
      effectsToRun.add(effectFn)
    }
  })

  // 将删除和添加操作也进行副作用执行
  if (type === ProxyType.DELETE || type === ProxyType.ADD) {
    iterateEffects && iterateEffects.forEach(effectFn => {
      if (effectFn !== activeEffect) {
        effectsToRun.add(effectFn)
      }
    })
  }

  // 如果为数组且为ADD 则取出所有length触发响应
  if (type === ProxyType.ADD && Array.isArray(target)) {
    let lengthEffects = depsMap.get('length')
    lengthEffects && lengthEffects.forEach(effectFn => {
      if (effectFn !== activeEffect) {
        effectsToRun.add(effectFn)
      }
    })
  }

  /* 如果为数组且修改的字段为length 则大于等于length的会被删除 将删除的添加响应列表 */
  if (Array.isArray(target) && key === 'length') {
    depsMap && depsMap.forEach((effects, index) => {
      if (index >= newVal) {
        effects.forEach(effectFn => {
          if (effectFn !== activeEffect) {
            effectsToRun.add(effectFn)
          }
        })
      }
    })
  }


  effectsToRun.forEach(effectFn => {
    // 如果一个副作用函数存在调度器，则调用该调度器，并将副作用函数作为参数传递
    if (effectFn.options?.scheduler) {
      effectFn.options.scheduler(effectFn)
    } else {
      // 否则直接执行副作用函数（之前的默认行为）
      effectFn()
    }
  })

}


export function effect(fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn)
    // 当调用 effect 注册副作用函数时，将副作用函数赋值给 activeEffect
    activeEffect = effectFn
    // 在调用副作用函数之前将当前副作用函数压入栈中
    effectStack.push(effectFn)

    // 将 fn 的执行结果存储到 res 中
    let res = fn()

    // 在当前副作用函数执行完毕后，将当前副作用函数弹出栈，并把 activeEffect 还原为之前的值
    effectStack.pop() // 新增
    activeEffect = effectStack[effectStack.length - 1]

    // 将 res 作为 effectFn 的返回值
    return res
  }
  // 将 options 挂载到 effectFn 上
  effectFn.options = options

  // activeEffect.deps 用来存储所有与该副作用函数相关的依赖集合
  effectFn.deps = []
  // 执行副作用函数

  // 只有当不为懒 的时候才会执行
  if (!options.lazy) {
    effectFn()
  }
  return effectFn
}

function cleanup(effectFn) {
  // 遍历 effectFn.deps 数组
  for (let i = 0; i < effectFn.deps.length; i++) { // deps 是依赖集合
    const deps = effectFn.deps[i]
    // 将 effectFn 从依赖集合中移除
    deps.delete(effectFn)
  }
  // 最后需要重置 effectFn.deps 数组
  effectFn.deps.length = 0
}
