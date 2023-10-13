
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
  setElementAttr
}
