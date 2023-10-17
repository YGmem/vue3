
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
 * @param {*} el 被添加的dom
 * @param {*} parent 容器dom
 * @param {*} anchor 暂时不知道
 */
function insert(el, parent, anchor = null) {
  parent.appendChild(el, anchor)
}



// 将属性设置相关操作封装到 patchProps 函数中，并作为渲染器选项传递
export function patchProps(el, key, prevValue, nextValue) {
  // 判断是否能直接修改 这里要注意直接修改和使用setAttribute 的区别，区别setAttribute 设置的是默认值，哪怕修改了，获取后也是一开始设置的默认值，但是直接修改是修改html属性后续变更是可以变化的
  if (shouldSetAsProps(el, key, nextValue)) {
    // 提取dom上这个属性的类型比如disable就是boolean
    let type = typeof el[key]

    // 判断value是否为空字符串且dom上需要为布尔值的属性，为则转换为true, 因为如果不转换会默认变成false 但是用户操作希望是true
    if (type === 'boolean' && nextValue === '') {
      el[key] = true
    } else {
      el[key] = false
    }

  } else {
    // 如果不能使用setAttribute 修改
    setElementAttr(el, key, nextValue)
  }

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


export const options = {
  createElement,
  insert,
  setElementText,
  setElementAttr,
  patchProps
}
