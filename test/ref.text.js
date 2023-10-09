import { effect } from "../reactivity/effect.js"
import { reactive } from "../reactivity/reactive.js"
import { ref, toRef, toRefs, proxyRefs } from "../reactivity/ref.js"


/* ref实现 */
// let a = ref(1)

// effect(() => {
//   console.log(a.value)
// })

// a.value = 2


/* toRef实现 */
// obj 是响应式数据
const obj = reactive({ foo: 1, bar: 2 })

// // 将响应式数据展开到一个新的对象 newObj
// const newObj = {
//   ...obj
// }

// effect(() => {
//   // 在副作用函数内通过新的对象 newObj 读取 foo 属性值
//   console.log(newObj.foo)
// })

// // 很显然，此时修改 obj.foo 并不会触发响应
// obj.foo = 100



// 使用toRef后可以实现
// const newObj = {
//   foo: toRef(obj, 'foo')
// }

// effect(() => {
//   // 在副作用函数内通过新的对象 newObj 读取 foo 属性值 
//   console.log(newObj.foo.value)
// })

// // 此时修改 obj.foo 会触发响应
// obj.foo = 100
// newObj.foo.value = 22


/* 使用toRefs更加简洁 */
// const newObj = { ...toRefs(obj) }

// effect(() => {
//   // 在副作用函数内通过新的对象 newObj 读取 foo 属性值
//   console.log(newObj.foo.value)
// })

// // 此时修改 obj.foo 会触发响应
// obj.foo = 100
// newObj.foo.value = 22



/* 脱ref */
// const obj2 = reactive({ foo: 1, bar: 2 })
// obj2.foo // 1
// obj2.bar // 2

// const newObj = { ...toRefs(obj) }
// newObj.foo.value // 1
// newObj.bar.value // 2

// // 使用脱ref后
// const objT = proxyRefs(toRefs(obj))
// console.log(objT.foo)
// console.log(objT.bar)



const count = ref('1')
const obj3 = reactive({ count })

console.log(obj3.count)


