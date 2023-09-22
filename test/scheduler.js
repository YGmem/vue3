import { effect } from '../reactivity/effect.js'
export default function (proxyObj) {

  /* 调度器  只会执行一次*/
  // 定义一个任务队列
  const jobQueue = new Set()
  // 使用 Promise.resolve() 创建一个 promise 实例，我们用它将一个任务添加到微任务队列
  const p = Promise.resolve()

  // 一个标志代表是否正在刷新队列
  let isFlushing = false
  function flushJob() {
    // 如果队列正在刷新，则什么都不做
    if (isFlushing) return
    // 设置为 true，代表正在刷新
    isFlushing = true
    // 在微任务队列中刷新 jobQueue 队列
    p.then(() => {
      jobQueue.forEach(job => job())
    }).finally(() => {
      // 结束后重置 isFlushing
      isFlushing = false
    })
  }


  effect(() => {
    console.log(proxyObj.age)
  }, {
    scheduler(fn) {
      // 每次调度时，将副作用函数添加到 jobQueue 队列中
      jobQueue.add(fn)
      // 调用 flushJob 刷新队列
      flushJob()
    }
  })

  proxyObj.age = 1
  proxyObj.age = 2
  proxyObj.age = 3  // 只触发最后一次

}

