import { computed } from '../reactivity/computed.js'
import { effect } from '../reactivity/effect.js'

export default function (proxyObj) {

  let a = computed(() => {
    // console.log(proxyObj.age)
    return proxyObj.age
  })
  // 如果副作用
  effect(() => {
    console.log(a.value)
  })

  console.log(a.value)
  console.log(a.value)
  proxyObj.age++
  console.log(a.value)

}