import { createRenderer } from "../renderer/renderer.js"
import { options } from "../renderer/options.js"
let renderer = createRenderer(options)

// 旧 vnode
const oldVNode = {
  type: 'div',
  children: [
    { type: 'p', children: '1', key: "1" },
    { type: 'div', children: '2', key: "2" },
    { type: 'h2', children: '3', key: "3" },
  ]
}

// 新 vnode
const newVNode = {
  type: 'div',
  children: [
    { type: 'P', children: '4', key: "3" },
    { type: 'p', children: '7', key: "1" },
    { type: 'p', children: '5', key: "2" },
    // { type: 'p', children: '6' },
    // { type: 'p', children: '6' },
  ]
}




renderer.render(oldVNode, '#app')


setTimeout(() => {
  renderer.render(newVNode, '#app')
}, 2000)