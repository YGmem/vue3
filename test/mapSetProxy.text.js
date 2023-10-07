import { reactive } from "../reactivity/reactive.js"
import { effect } from "../reactivity/effect.js"

/* set响应实现 */
// let set = new Set()

// let setProxy = reactive(set)

// effect(() => {
//   console.log(setProxy.size)
// })

// setProxy.add(1)
// setProxy.delete(1)



/* map响应实现 */
// let map = new Map()

// let mapProxy = reactive(map)

// mapProxy.set(1, 2)
// effect(() => {
//   console.log(mapProxy.get(1))
// })

// mapProxy.set(1, 3)

// console.log(mapProxy.get(1))


/* 深层响应bug */
// 原始 Map 对象 m
// const m = new Map()
// // p1 是 m 的代理对象
// const p1 = reactive(m)
// // p2 是另外一个代理对象
// const p2 = reactive(new Map())
// // 为 p1 设置一个键值对，值是代理对象 p2
// p1.set('p2', p2)

// effect(() => {
//   // 注意，这里我们通过原始数据 m 访问 p2
//   console.log(m.get('p2').size)
// })
// // 注意，这里我们通过原始数据 m 为 p2 设置一个键值对 foo --> 1
// m.get('p2').set('foo', 1)


/* foreach 响应 */
const p = reactive(new Map([
  [{ key: 1 }, { value: 1 }]
]))

effect(() => {
  p.forEach(function (value, key) {
    console.log(value) // { value: 1 }
    console.log(key) // { key: 1 }
  })
})

// 能够触发响应
p.set({ key: 2 }, { value: 2 })



