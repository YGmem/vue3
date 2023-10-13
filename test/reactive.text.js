import { reactive, shallowReactive, readonly } from "../reactivity/reactive.js"
import { effect } from "../reactivity/effect.js"

export default function () {

  let obj = {}
  let proto = { bar: 1, obj2: { name: "阳光" }, arr: [1] }

  // 防止原型更新
  // let child = reactive(obj)
  // let parent = reactive(proto)

  // Object.setPrototypeOf(child, parent)

  // effect(() => {
  //   console.log(child.bar)
  // })

  // child.bar = 2


  // 深响应 和 浅响应
  // let pObj = reactive(proto)
  // let sObj = shallowReactive(proto)

  // debugger
  // effect(() => {
  //   // console.log(pObj.obj2.name)
  //   console.log(sObj.obj2.name);
  // })


  // sObj.obj2.name = "阳光2"


  // 只读
  // let pObj = readonly(proto)

  // effect(() => {
  //   // console.log(pObj.bar);
  //   console.log(pObj.obj2)
  // })

  // pObj.obj2 = 1

  /* 比较两个 */



  /* includes 和全等实现 */
  // let proxyObj = reactive([obj])
  // // 因为代理对象和代理对象是不等的所以之前的代码会为false , 现在的代码存储代理对象存在就返回实现全等和includes
  // // console.log(proxyObj.obj === proxyObj.obj)
  // console.log(proxyObj.includes(proxyObj[0]))

  /* 实现原始对象也可以查询 */
  // // 这里之前代码为false 因为proxyObj里面的代理对象，但是现在查询的是原始对象，要实现得重写includes方法(还有indexOf，laseIndexOf),使用原始对象再次查询一遍
  // console.log(proxyObj.includes(obj))

}


