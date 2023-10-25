import { isArray } from "../utils/utils.js"



/**
 * @description: 创建渲染器
 * @param options 创建所需的方法，这个是为了跨平台，为了不依赖浏览器原生的方法，将修改的方法当做参数传递，这样即可实现跨平台，因为只要我们修改传的方法即可实现在不同平台运行
 */
export function createRenderer(options = {}) {

  const {
    createElement,
    insert,
    setElementText,
    setElementAttr,
    patchProps
  } = options



  /**
    * @description: 渲染函数
    * @param vnode 虚拟dom 
    * 类似这种
    * ```js
    * let a = {
    *    type:'h1',
    *    props:{
    *     disable: false
    *    },
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
        unmount(container._vnode)
      }
    }
    container._vnode = vnode
  }



  /**
   * @description: 页面打补丁
   * @param {*} n1 旧节点
   * @param {*} n2 新节点
   * @param {*} container 容器(dom元素)
   */
  function patch(n1, n2, container) {

    // 判断新旧节点的类型是否一致 如果不一致要先卸载旧的
    if (n1 && n1.type !== n2.type) {
      unmount(n1)
      n1 = null
    }

    let { type } = n2
    type = typeof type
    switch (type) {
      case 'string': // 如果为字符串表示为普通挂载
        // 如果旧节点不存在表示为第一次更新，执行挂载操作

        if (!n1) {
          mountElement(n2, container)
        } else {
          // 更新
          patchElement(n1, n2, container)
        }
        break
      case 'object': // 为对象表示为组件
        break
      default:
        break
    }

  }


  /**
   * @description: 节点的更新操作
   * @param {*} n1 旧节点
   * @param {*} n2 新节点
   * @param {*} container
   */
  function patchElement(n1, n2) {
    const el = n2.el = n1.el
    const oldProps = n1.props
    const newProps = n2.props
    // 第一步：更新 props
    for (const key in newProps) {
      if (newProps[key] !== oldProps[key]) {
        patchProps(el, key, oldProps[key], newProps[key])
      }
    }
    for (const key in oldProps) {
      if (!(key in newProps)) {
        patchProps(el, key, oldProps[key], null)
      }
    }

    // 第二步：更新 children
    patchChildren(n1, n2, el)
  }


  /**
   * @description: 
   * @param {*} n1
   * @param {*} n2
   * @param {*} container
   * @return {*}
   */
  function patchChildren(n1, n2, container) {
    // 判断新子节点的类型是否是文本节点
    if (typeof n2.children === 'string') {
      // 旧子节点的类型有三种可能：没有子节点、文本子节点以及一组子节点
      // 只有当旧子节点为一组子节点时，才需要逐个卸载，其他情况下什么都不需要

      if (Array.isArray(n1.children)) {
        n1.children.forEach((c) => unmount(c))
      }
      // 最后将新的文本节点内容设置给容器元素
      setElementText(container, n2.children)
    } else if (Array.isArray(n2.children)) {
      // 说明新子节点是一组子节点

      // 判断旧子节点是否也是一组子节点
      if (Array.isArray(n1.children)) {
        // 代码运行到这里，则说明新旧子节点都是一组子节点，这里涉及核心的Diff 算法
      } else {
        // 此时：
        // 旧子节点要么是文本子节点，要么不存在
        // 但无论哪种情况，我们都只需要将容器清空，然后将新的一组子节点逐个挂载
        setElementText(container, '')
        n2.children.forEach(c => patch(null, c, container))
      }
    }
  }


  /**
   * @description: 挂载节点
   * @param {*} vnode 需要挂载的虚拟dom
   * @param {*} container 挂载的真实dom
   */
  function mountElement(vnode, container) {
    // 创建dom 并给虚拟dom添加el属性指向真实dom
    let el = vnode.el = createElement(vnode.type)

    if (vnode.props) {
      for (const key in vnode.props) {
        // 给dom添加属性
        patchProps(el, key, null, vnode.props[key])
      }
    }


    if (typeof vnode.children === 'string') {
      // 如果子节点为字符串表示子节点为文本内容直接挂载
      setElementText(el, vnode.children)
    } else if (isArray(vnode.children)) {
      // 如果子节点为数组表示子节点为多个虚拟dom
      vnode.children.forEach(item => {
        mountElement(item, el)
      })
    }

    // 将容器添加到真实dom节点
    insert(el, container)

  }


  return {
    render
  }
}






/**
 * @description: 执行dom卸载操作
 * @param {*} vnode 需要卸载的虚拟dom
 */
function unmount(vnode) {
  console.log("🚀 ~ file: renderer.js:117 ~ unmount ~ vnode.el:", vnode.el, vnode)
  let parent = vnode.el.parentNode
  if (parent) {
    parent.removeChild(vnode.el)
  }
}