
import proxyObjFn from './proxy/index.js'

/* 测试使用 */
import scheduler from './test/scheduler.js'
import computed from './test/computed.js'
import cleanup from './test/cleanup.js'
import watch from './test/watch.js'
import effectTest from './test/effectTest.js'

let obj = {
  name: '阳光',
  age: 20,
  get fn() {
    return this.age
  }
}


let proxyObj = proxyObjFn(obj)



/* 调度器 只会执行一次 */
// scheduler(proxyObj)

/* 计算属性 */
// computed(proxyObj)

/* 删除不需要执行的依赖(副作用) */
// cleanup(proxyObj)

/* 监听 */
// watch(proxyObj)

/* effect */

effectTest(proxyObj)