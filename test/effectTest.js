import { effect } from "../effect/index.js"

export default function (proxyObj) {

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
  effect(() => {
    for (const key in proxyObj) {
      console.log(key)
    }
  })
  // 添加删除 属性操作会重新触发 赋值不会 以免不必要的更新
  proxyObj.children = '光'
  proxyObj.name = '阳光2'
  delete proxyObj.children
}
