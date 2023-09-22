import { effect } from "../reactivity/effect.js"
import { reactive } from "../reactivity/reactive.js"

export default function () {

  let obj = {
    name: '阳光',
    age: 20,
    get fn() {
      return this.age
    },
    arr: [1, 2, 3]
  }

  let proxyObj = reactive(obj)

  /* 函数内返回代理对象的响应 */
  // effect(() => {
  //   console.log(11111);
  //  console.log(proxyObj.fn); 
  // })

  // proxyObj.age = 1

  /*  in 操作的响应 */
  // effect(() => {
  //   console.log('name' in proxyObj)
  // })

  // proxyObj.name = '光'


  /* for in的拦截操作 */
  // effect(() => {
  //   for (const key in proxyObj) {
  //     console.log(key)
  //   }
  // })
  // // 添加删除 属性操作会重新触发 赋值不会 以免不必要的更新
  // proxyObj.children = '光'
  // proxyObj.name = '阳光2'
  // delete proxyObj.children


  /* 数组的响应建立 */
  // effect(() => {
  //   console.log(proxyObj.arr[0])
  // })
  // proxyObj.arr[0] = 2  // 普通的数组响应已经实现


  /* length 的响应 */
  // effect(() => {
  //   console.log(proxyObj.arr.length)
  // })
  // proxyObj.arr[0] = 2  // 如果只是设置长度在范围 不会触发依赖响应
  // proxyObj.arr[3] = 4 // 长度如果超出 触发响应


  /* 数组设置length 超出或等于length的值被删除，需要响应 */
  effect(() => {
    console.log(proxyObj.arr[0]) // 不触发
  })

  effect(() => {
    console.log(proxyObj.arr[2])  // 被删除触发响应
  })

  proxyObj.arr.length = 2 

}
