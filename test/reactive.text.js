import reactive from "../reactive/index.js"
import { effect } from "../effect/index.js"

export default function () {
  let a = {}
  let b = { bar: 1 }

  let proxyA = reactive(a)
  let proxyB = reactive(b)

  Object.getPrototypeOf(a, b)

  effect(() => {
    console.log(proxyA.bar)
  })

  proxyA.bar = 2

}


