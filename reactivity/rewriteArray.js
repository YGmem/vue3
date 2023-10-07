import { ReactiveFlags } from "../operations/index.js"
import { resetTracking, pauseTracking } from "./effect.js"



/* 重写的数组方法数组集合 */
export const arrayInstrumentations = createArray()

/* 因为如果使用includes方法如果是使用原始值对象去匹配是不等于代理对象的所以要重写数组方法用原始对象再调用一次寻找 */
function createArray() {
  let arrayRebase = {};
  ['lastIndexOf', 'includes', 'indexOf'].forEach(methods => {
    let originMethods = Array.prototype[methods]
    arrayRebase[methods] = function (...args) {

      let res = originMethods.apply(this, args)

      // 如果为-1 或者false表示没有找到调用原始对象再调用一下方法寻找
      if (res === -1 || res === false) {
        res = originMethods.apply(this[ReactiveFlags.RAW], args)
      }
      return res
    }
  });

  /* 重写会修改length的数组方法，以免两个副作用调用收集length 会导致其中一个设置length另一个读取了length导致触发这个依赖响应然后另一个里面又使用了这些数组方法又触发导致栈溢出 */
  ['push', 'pop', 'shift', 'unshift', 'splice'].forEach(methods => {
    let originMethods = Array.prototype[methods]
    arrayRebase[methods] = function (...args) {
      pauseTracking()
      let res = originMethods.apply(this, args)
      resetTracking()
      return res
    }
  })


  return arrayRebase
}


