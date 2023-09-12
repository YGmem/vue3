import { renderer } from "../renderer/index.js"

debugger
const vnode = {
  tag: 'div',
  props: {
    onClick: () => alert('hello')
  },
  children: '测试render函数按钮' // 从 click me 改成 click again
}

11111111111111111111111111111111

// MyComponent 是一个对象
const MyComponent = {
  render() {
    return {
      tag: 'div',
      props: {
        onClick: () => alert('hello')
      },
      children: 'click me'
    }
  }
}
// const vnode = {
//    tag: MyComponent
// }

function render() {
  // 为了效果更加直观，这里没有使用 h 函数，而是直接采用了虚拟 DOM 对象
  // 下面的代码等价于：
  // return h('div', { id: 'foo', class: cls })
  return {
    tag: 'div',
    props: {
      id: 'foo',
      class: cls
    }
  }
}

renderer(vnode, document.body)