import { isArray } from "../utils/utils.js"

/**
 * @description: 创建dom元素
 * @param {*} tag 节点名称
 */
function createElement(tag) {
  return tag ? document.createElement(tag) : null
}


/**
 * @description: 给指定dom元素添加文本节点内容
 * @param {*} el dom节点
 * @param {*} text 文本内容
 */
function setElementText(el, text) {
  el.textContent = text
}




/**
 * @description: 在给定的parent下添加指定
 * @param {string} el 被添加的dom
 * @param {*} parent 容器dom
 * @param {*} anchor 暂时不知道
 */
function insert(el, parent, anchor = null) {
  parent.appendChild(el, anchor)
}



// 将属性设置相关操作封装到 patchProps 函数中，并作为渲染器选项传递
export function patchProps(el, key, prevValue, nextValue) {


  // 如果为class使用 className修改class这样性能好
  if (key === 'class') {
    el.className = nextValue || ''
  } else if (shouldSetAsProps(el, key, nextValue)) {
    // 判断是否能直接修改 这里要注意直接修改和使用setAttribute 的区别，区别setAttribute 设置的是默认值，哪怕修改了，获取后也是一开始设置的默认值，但是直接修改是修改html属性后续变更是可以变化的
    // 提取dom上这个属性的类型比如disable就是boolean
    let type = typeof el[key]

    // 判断value是否为空字符串且dom上需要为布尔值的属性，为则转换为true, 因为如果不转换会默认变成false 但是用户操作希望是true
    if (type === 'boolean' && nextValue === '') {
      el[key] = true
    } else {
      el[key] = false
    }

  } else if (/^on/.test(key)) {
    // 如果开头为on表示为事件
    let eventName = key.slice(2).toLowerCase()

    let invoker = el._vei || (el._vei = {})
    invoker = invoker[key]
    if (nextValue) {
      if (!invoker) { // 判断监听函数是否存在
        // 如果不存在定义这个并且直接监听，这样更新就不用删除之前的再监听，直接替换监听的函数即可
        invoker = el._vei[key] = (e) => {

          // e.timestamp 事件发生的时间，如果发生的时间早于定义该函数的时间，不触发该绑定的函数
          console.log(e, invoker.attached, e.timestamp <= invoker.attached)

          if (!e._vts) {  // 这里可以判断有没有这个属性，如果没有就表示第一次绑定事件
            e._vts = Date.now()
          } else if (e._vts <= invoker.attached) { // 如果已经绑定了事件判断如果发生的时间早于定义该函数的时间，不触发该绑定的函数
            return
          }
          // 如果为数组表示为监听多个函数 onClick:[fn1,fn2]
          if (isArray(invoker.value)) {
            invoker.value.forEach(fn => fn(e))
          } else {
            // 否则为普通监听 onClick:()=>{}
            invoker.value(e)
          }
        }
        invoker.value = nextValue
        invoker.attached = getNow() // 给一个定义的时间的时间戳
        el.addEventListener(eventName, invoker)
      } else {
        // 如果存在就直接替换这个函数即可
        invoker.value = nextValue
      }
    } else if (invoker) {
      // 如果没有就直接删除监听
      el.removeEventListener(eventName, invoker)
    }



  } else {
    // 如果不能使用setAttribute 修改
    setElementAttr(el, key, nextValue)
  }

}


let timestamp
let p = Promise.resolve()
/**
 * @description: 获取当前时间的时间戳 并为了减少Date创建时间戳的性能消耗，同一个任务队列获取的缓存时间戳，时间戳会下一个微任务队列执行时重置
 */
function getNow() {
  return timestamp || ((p.then(() => timestamp = 0)), timestamp = Date.now())
}


/**
 * @description: 判断dom上的不然直接修改特殊的属性 为则返回false
 * @param {*} el dom
 * @param {*} key 属性
 * @param {*} value 属性值
 */
function shouldSetAsProps(el, key, value) {

  // input的form 属性无法直接修改是只读的 返回false
  if (key === 'form' && el.tagName === 'INPUT') return false


  // 兜底 存在就会返回true
  return key in el
}


/**
 * @description: 设置dom元素属性值
 * @param {*} el dom
 * @param {*} attr 属性
 * @param {*} value 值
 */
function setElementAttr(el, attr, value = '') {
  el.setAttribute(attr, value)
}


/**
 * @description: 设置文本内容
 * @param {*} el dom
 * @param {*} text 文本内容
 */
export function setText(el, text) {
  el.nodeValue = text
}


/**
 * @description: 创建文本节点
 * @param {*} text 文本内容
 */
export function createText(text) {
  return document.createTextNode(text)
}
/**
 * @description: 创建注释节点
 * @param {*} text 注释内容
 */
export function createComment(text) {
  return document.createComment(text)
}


export const options = {
  createElement,
  insert,
  setElementText,
  setElementAttr,
  patchProps,
  setText,
  createText,
  createComment
}
