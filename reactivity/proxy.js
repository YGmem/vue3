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
    console.log('🚀 ~ get ~ target, key, receiver:', target, key, receiver)

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
    /* 
    这里用 Reflect.get 是因为this的问题,如果用target[key] 因为我们监听的是代理对象,如果target[key]是在对象里面使用 ，

    比如 let a = { b:1,get c(){ this.b } },
    let proxyObj = reactive(a)

    函数内返回代理对象的响应 
      effect(() => {
        debugger
        console.log(proxyObj.c)
      })
      proxyObj.b = 1

     1. 我们effect里面调用proxyObj.c 就会触发c的get方法，我们会对c进行依赖收集

     2. 然后走到执行get函数触发里面的this.c 的时候 由于this的指向问题,这里this会指向原始对象，而不是代理对像导致代理对应的get方法无法触发就收集不到b的effect响应依赖搜集
     
     3. 然后我们去修改b 就无法触发的get方法进行追踪，因为没有进行代理的依赖收集 ，

     4. 但是我们用Reflect 可以使用第三个参数 receiver, 可以理解这个为调用过程的this 例如 const obj = { foo: 1 } console.log(Reflect.get(obj, 'foo', { foo: 2 })) // 输出的是 2 而不是 1 
    
     5. 这样的话我们可以将get给我们的receiver(原始操作对象) 也就是代理的对象给Reflect
     这样触发proxyObj.c 的get的时候的这个this就会变成代理对象
      
     6. 这样调用c(){this.b } 就会触发代理对象的get方法 让子属性实现响应依赖收集更新 实现修改 proxyObj.b 的时候因为收集了依赖effect 会触发
    */
    const res = Reflect.get(target, key, receiver)
    // const res = target[key]


    // 如果是浅响应，则直接返回原始值
    if (isShallow) {

      return res
    }

    // 实现脱ref 如果为ref直接返回.value后的值 源码里跳过了数组和整数的解包
    if (isRef(res)) {
      return res.value
    }


    // 如果是对象调用 reactive 代理子对象返回响应对象 
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
    // let res = target[key] = newVal

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

