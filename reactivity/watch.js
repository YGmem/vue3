import { effect } from "./effect.js"
import { ref} from '../reactivity/ref.js'

export default function watch(source, cb, options = {}) {

  let getter
  // 如果 source 是函数，说明用户传递的是 getter，所以直接把 source 赋值给 getter
  if (typeof source === 'function') {
    getter = source
  } else {
    // 否则按照原来的实现调用 traverse 递归地读取
    getter = () => traverse(source)
  }

  // 定义旧值与新值
  let oldValue, newValue

  // cleanup 用来存储用户注册的过期回调
  let cleanup

  // 用户上一次watch触发的回调函数
  function onInvalidate(fn) {
    // 将过期回调存储到 cleanup 中
    cleanup = fn
  }

  // 提取 scheduler 调度函数为一个独立的 job 函数
  let job = () => {
    // 在 scheduler 中重新执行副作用函数，得到的是新值
    newValue = effectFn()
    if (cleanup) {
      cleanup()
    }
    // 将旧值和新值作为回调函数的参数 onInvalidate 作为回调函数的第三个参数，以便用户使用
    cb(newValue, oldValue, onInvalidate)
    // 更新旧值，不然下一次会得到错误的旧值
    oldValue = newValue
  }

  let effectFn = effect(
    () => getter(),
    {
      lazy: true,
      scheduler() {
        // 在调度函数中判断 flush 是否为 'post'，如果是，将其放到微任务队列中执行 'pre' 和 'post' 暂未实现 语义指的就是组件更新前和更新后
        if (options.flush === 'post') {
          let p = Promise.resolve()
          p.then(job)
        } else {
          job()
        }
      },
    }
  )
  if (options.immediate) {
    // 当 immediate 为 true 时立即执行 job，从而触发回调执行
    job()
  } else {
    // 手动调用副作用函数，拿到的值就是旧值
    oldValue = effectFn()
  }
}

function traverse(value, seen = new Set()) {
  // 如果要读取的数据是原始值，或者已经被读取过了，那么什么都不做
  if (typeof value !== 'object' || typeof value === null
    || seen.has(value)) return
  // 将数据添加到 seen 中，代表遍历地读取过了，避免循环引用引起的死循环
  seen.add(value)

  // 假设 value 就是一个对象，使用 for...in 读取对象的每一个值，并递归地调用 traverse 进行处理
  for (const i in value) {
    traverse(value[i], seen)
  }

  return value
}