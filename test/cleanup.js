import { effect } from "../effect/index.js"

export default function (proxyObj) {
  effect(function effectFn() {
    console.log('触发')
    document.body.innerText = proxyObj.name ? proxyObj.age : 'not'
  })

  proxyObj.name = false
  proxyObj.age = false // 不会执行 因为执行name 的时候 执行的副作用函数 会将有关的依赖删除 但是age 没有执行 读取操作 对应的依赖相应也被删除了
}

