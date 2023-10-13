import { createRenderer } from "../renderer/renderer.js"
import { options } from "../renderer/options.js"



let renderer = createRenderer(options)


let el = {
  type: "h1",
  props: {
    id: "test"
  },
  children: "我是内容"
}

renderer.render(el, document.querySelector('#app'))
