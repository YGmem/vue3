import { reactive, shallowReactive, readonly } from "../reactivity/reactive.js"
import { effect } from "../reactivity/effect.js"

export default function () {

  let obj = {}
  let proto = { bar: 1, obj2: { name: "阳光" } }

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
  let pObj = readonly(proto)

  effect(() => {
    // console.log(pObj.bar);
    console.log(pObj.obj2)
  })

  pObj.obj2 = 1

}


