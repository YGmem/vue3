import { isArray } from "../utils/utils.js"



/**
 * @description: 创建渲染器
 * @param {*} options 创建所需的方法，这个是为了跨平台，为了不依赖浏览器原生的方法，将修改的方法当做参数传递，这样即可实现跨平台，因为只要我们修改传的方法即可实现在不同平台运行
 */
export function createRenderer(options = {}) {

  const {
    createElement,
    insert,
    setElementText,
    setElementAttr
  } = options



  /**
 * @description: 
 * @param vnode 虚拟dom 
 * 类似这种
 * ```js
 * let a = {
 *    type:'h1',
 *    children:"内容",
 *    ...
 * }
 * 
 * @param container 容器(dom元素)
 */
  function render(vnode, container) {
    if (vnode) {
      patch(container._vnode, vnode, container)
    } else {
      // 如果新节点不存在表示为卸载操作清空dom内容
      if (container._vnode) {
        container.innerHTML = ''
      }
      container._vnode = ''
    }
  }



  /**
   * @description: 页面打补丁
   * @param {*} n1 旧节点
   * @param {*} n2 新节点
   * @param {*} container 容器(dom元素)
   */
  function patch(n1, n2, container) {
    // 如果旧节点不存在表示为第一次更新，执行挂载操作
    if (!n1) {
      mountedElement(n2, container)
    } else {

    }
  }



  /**
   * @description: 挂载节点
   * @param {*} vnode 需要挂载的虚拟dom
   * @param {*} container 挂载的真实dom
   */
  function mountedElement(vnode, container) {
    // 创建dom
    let el = createElement(vnode.type)

    if (vnode.props) {
      for (const key in vnode.props) {
        setElementAttr(el, key, vnode.props[key])
      }
    }


    if (typeof vnode.children === 'string') {
      // 如果子节点为字符串表示子节点为文本内容直接挂载
      setElementText(el, vnode.children)
    } else if (isArray(vnode.children)) {
      // 如果子节点为数组表示子节点为多个虚拟dom
      vnode.children.forEach(item => {
        mountedElement(item, el)
      })
    }

    // 将容器添加到真实dom节点
    insert(el, container)

  }


  return {
    render
  }
}






