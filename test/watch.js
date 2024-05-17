import watch from "../reactivity/watch.js"
import { ref } from '../reactivity/ref.js'

export default function (proxyObj) {

  /* 监听 */
  // watch(() => proxyObj.name, () => {
  //   console.log('proxyObj.name 被改变了')
  // })

  // proxyObj.age++ // 不变
  // proxyObj.name = '阳光明媚' // 变

  /* immediate实现 */
  // watch(() => proxyObj.age, (newVal, oldValue) => {
  //   console.log('proxyObj 被改变了', newVal, oldValue)
  // },
  //   {
  //     immediate: true
  //   })

  // proxyObj.age++
  // proxyObj.name = '阳光明媚'


  /* flush 执行时机实现 */
  // watch(() => proxyObj.age, (newVal, oldValue) => {
  //   console.log('proxyObj 被改变了', newVal, oldValue)
  // },
  //   {
  //     // 回调函数会在 watch 创建时立即执行一次
  //     flush: 'pre' // 还可以指定为 'post' | 'sync'
  //   })

  // proxyObj.age++

  /* 竞态问题解决 */
  // let source
  // watch(() => proxyObj.age, async (newVal, oldValue, onInvalidate) => {
  //   let expired = false

  //   onInvalidate(() => {
  //     expired = true
  //   })

  //   let data = await require()
  //   console.log('外面',data,expired);
  //   if (!expired) {
  //     console.log('里面',data);
  //     source = data
  //   }
  // })
  // /* 这里输出可以看见 source 的值为 第二次请求的值 哪怕第一次的请求要晚于 第二次 
  // 原理就是 第二次请求的时候会将第一次的onInvalidate 函数执行一次 第一次函数内部的作用域的expired 就为true 了 就不会进行赋值操作 已解决竞态问题 */
  // setTimeout(() => {
  //   console.log(source)
  // }, 3000)

  // proxyObj.age++
  // proxyObj.age++  




  /** 个人疑惑 */
  let obj = ref({
    a: "11"
  })
  // let obj = ref({
  //   obj2: {
  //     a:"11"
  //   }
  // })


  watch(obj.value, (nVal, oVal) => {
    console.log('🚀 ~ watch ~ nVal,oVal:', nVal, oVal)
  }, { deep: true })

  setTimeout(() => {
    // obj.value.obj2.a = '33'
    obj.value.a = '33'
  }, 1000)
  setTimeout(() => {
    // obj.value.obj2.a = '33'
    obj.value.a = '44'
  }, 2000)



}


let isOne = true
/* 模拟一个请求让第1次 比第2次请求要慢返回结果 以达到竞态 */
function require() {
  return new Promise((resolve) => {

    if (isOne) {
      console.log(111)
      setTimeout(() => {
        resolve([11])
      }, 2000)
      isOne = false
    } else {
      console.log(222)
      setTimeout(() => {
        resolve([22])
      }, 1000)
    }

  })
}