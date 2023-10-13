import { renderer } from "../renderer/index.js"
import { ref } from "../reactivity/ref.js"
import { effect } from "../reactivity/effect.js"

const vnode = {
  tag: 'div',
  props: {
    onClick: () => alert('hello')
  },
  children: '测试render函数按钮' // 从 click me 改成 click again
}


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

function rendere(domString, container) {
  container.innerHTML = domString
}

let a = ref(1)

effect(() => {
  rendere(`<h1>${a.value}</h1>`, document.body)
})

setTimeout(() => {
  a.value = 2
}, 2000);

// renderer(vnode, document.body)