import { ReactiveFlags } from "../operations/index.js"

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
  })
  return arrayRebase
}


