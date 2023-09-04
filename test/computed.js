import { computed } from '../computed/index.js'
import { effect } from '../effect/index.js'

export default function (proxyObj) {

  let a = computed(() => {
    // console.log(proxyObj.age)
    return proxyObj.age
  })

  effect(() => {
    console.log(a.value)
  })

  console.log(a.value)
  console.log(a.value)
  proxyObj.age++
  console.log(a.value)

}