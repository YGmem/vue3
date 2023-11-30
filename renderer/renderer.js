import { isArray } from "../utils/utils.js"

export const Text = Symbol.for('v-txt')  // 文本节点
export const Comment = Symbol.for('v-cmt') // 注释节点
export const Fragment = Symbol.for('v-fgt') // 片段表示没有根节点的vue组件

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
    patchProps,
    createComment,
    setText,
    createText
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

    if (typeof container === 'string') {
      container = document.querySelector(container)
    }


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
    switch (type) {
      case Text: // 文本节点
        if (!n1) {
          // 调用 createText 函数创建文本节点
          const el = n2.el = createText(n2.children)
          insert(el, container)
        } else {
          const el = n2.el = n1.el
          if (n2.children !== n1.children) {
            // 调用 setText 函数更新文本节点的内容
            setText(el, n2.children)
          }
        }
        break
      case Comment: // 注释节点
        if (!n1) {
          // 调用 createText 函数创建注释节点
          const el = n2.el = createComment(n2.children)
          insert(el, container)
        } else {
          // 不支持动态更新注释
          n2.el = n1.el
        }
        break
      case Fragment: // 碎片节点表示没有唯一根节点的vue组件
        if (!n1) {
          // 如果旧 vnode 不存在，则只需要将 Fragment 的 children 逐个挂载即可
          n2.children.forEach(c => patch(null, c, container))
        } else {
          // 如果旧 vnode 存在，则只需要更新 Fragment 的 children 即可
          patchChildren(n1, n2, container)
        }
        break

      default:
        // 目前默认就当 type:'h1' 这种来
        if (!n1) {
          mountElement(n2, container)
        } else {
          // 
          patchElement(n1, n2)
        }
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
   * @description: 更新子节点
   * @param {*} n1 旧节点
   * @param {*} n2 新节点
   * @param {*} container dom
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
        debugger
        /* 第一版 全部卸载 全部挂载 */
        // // 将旧的一组子节点全部卸载 
        // n1.children.forEach(c => unmount(c))
        // // 再将新的一组子节点全部挂载到容器中 
        // n2.children.forEach(c => patch(null, c, container))

        const oldChildren = n1.children
        const newChildren = n2.children
        // 旧的一组子节点的长度 
        const oldLen = oldChildren.length
        // 新的一组子节点的长度 
        const newLen = newChildren.length
        // 两组子节点的公共长度，即两者中较短的那一组子节点的长度 
        const commonLength = Math.min(oldLen, newLen)
        // 遍历 commonLength 次 
        for (let i = 0; i < commonLength; i++) {
          patch(oldChildren[i], newChildren[i], container)
        }
        // 如果 newLen > oldLen，说明有新子节点需要挂载 
        if (newLen > oldLen) {
          for (let i = commonLength; i < newLen; i++) {
            patch(null, newChildren[i], container)
          }
        } else if (oldLen > newLen) {
          // 如果 oldLen > newLen，说明有旧子节点需要卸载 
          for (let i = commonLength; i < oldLen; i++) {
            unmount(oldChildren[i])
          }
        }
      } else {
        // 此时：
        // 旧子节点要么是文本子节点，要么不存在
        // 但无论哪种情况，我们都只需要将容器清空，然后将新的一组子节点逐个挂载
        setElementText(container, '')
        n2.children.forEach(c => patch(null, c, container))
      }
    } else {
      // 代码运行到这里，说明新子节点不存在 
      // 旧子节点是一组子节点，只需逐个卸载即可 
      if (Array.isArray(n1.children)) {
        n1.children.forEach(c => unmount(c))
      } else if (typeof n1.children === 'string') {
        // 旧子节点是文本子节点，清空内容即可 
        setElementText(container, '')
      }
      // 如果也没有旧子节点，那么什么都不需要做 
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
      vnode.children.forEach(child => {
        patch(null, child, el)
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
  // 在卸载时，如果卸载的 vnode 类型为 Fragment，则需要卸载其 children
  if (vnode.type === Fragment) {
    vnode.children.forEach(c => unmount(c))
    return
  }

  let parent = vnode.el.parentNode
  if (parent) {
    parent.removeChild(vnode.el)
  }
}