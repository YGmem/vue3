import { createRenderer } from "../renderer/renderer.js"
import { options } from "../renderer/options.js"



let renderer = createRenderer(options)


// let el = {
//   type: "h1",
//   props: {
//     id: "test"
//   },
//   children: "我是内容"
// }


// renderer.render(el, document.querySelector('#app'))





// let elInput = {
//   type: "input",
//   props: {
//     disabled: ''
//   }
// }


// renderer.render(elInput, document.querySelector('#app'))



let el = {
  type: "h1",
  props: {
    id: "test"
  },
  children: "我是内容2秒后我会被卸载"
}


renderer.render(el, document.querySelector('#app'))


setTimeout(() => {
  renderer.render(null, document.querySelector('#app'))
}, 2000)