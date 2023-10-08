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
// // 注意，这里我们通过原始数据 m 为 p2 设置一个键值对 foo --> 1 也触发了响应
// m.get('p2').set('foo', 1)


/* foreach 响应 */
// const p = reactive(new Map([
//   [{ key: 1 }, { value: 1 }]
// ]))

// effect(() => {
//   p.forEach(function (value, key) {
//     console.log(value) // { value: 1 }
//     console.log(key) // { key: 1 }
//   })
// })

// // 能够触发响应
// p.set({ key: 2 }, { value: 2 })

// const key = { key: 1 }
// const value = new Set([1, 2, 3])
// const p = reactive(new Map([
//   [key, value]
// ]))
// effect(() => {
//   p.forEach(function (value, key) {
//     console.log(value.size) // 3
//   })
// })

// p.get(key).delete(1)



/* map foreach的Set也需要响应 */
// const p = reactive(new Map([
//   ['key', 1]
// ]))

// effect(() => {
//   p.forEach(function (value, key) {
//     // forEach 循环不仅关心集合的键，还关心集合的值
//     console.log(value) // 1
//   })
// })

// p.set('key', 2) // 即使操作类型是 SET，也应该触发响应



/* 迭代器 */
// const p = reactive(new Map([
//   ['key1', 'value1'],
//   ['key2', 'value2']
// ]))
// console.log(p.entries());
// effect(() => {
//   // TypeError: p is not iterable
//   for (const [key, value] of p.entries()) {
//     console.log(key, value)
//   }
// })

// p.set('key3', 'value3')
// p.set('key3', 'value4')


/* values和keys的响应问题 */
const p = reactive(new Map([
  ['key1', 'value1'],
  ['key2', 'value2']
]))

effect(() => {
  for (const value of p.keys()) {
    console.log(value) // key1 key2
  }
})

p.set('key2', 'value3') // 这是一个 SET 类型的操作，它修改了 key2 的值 但是我们只操作了keys 没有操作values key1 和key2 没变 所以理想状态下应该不会触发响应

p.set('key2', 'value3') // 不会触发响应
p.set('key3', 'value3') // 能够触发响应

