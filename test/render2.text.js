import { createRenderer } from "../renderer/renderer.js"
import { options } from "../renderer/options.js"
import { ref } from "../reactivity/ref.js"
import { effect } from "../reactivity/effect.js"
import { Comment, Fragment, Text } from "../renderer/renderer.js"
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


/* 卸载 */

// let el = {
//   type: "h1",
//   props: {
//     id: "test",
//     onClick:()=>{
//       alert('点击事件触发')
//     }
//   },
//   children: "我是内容2秒后我会被卸载"
// }


// renderer.render(el, document.querySelector('#app'))


// setTimeout(() => {
//   renderer.render(null, document.querySelector('#app'))
// }, 2000)


/* 事件 */

// let el = {
//   type: "h1",
//   props: {
//     id: "test",
//     // onClick: () => {
//     //   alert('点击事件触发')
//     // },
//     onClick: [ // 支持数组形式监听多个函数 
//       () => {
//         console.log(1)
//       },
//       () => {
//         console.log(2)
//       }
//     ]
//   },
//   children: "我是内容"
// }

// let el2 = {
//   type: "h1",
//   props: {
//     id: "test",
//     onClick: () => {
//       alert('两秒后更新的点击事件')
//     }
//   },
//   children: "我是内容"
// }



// renderer.render(el, document.querySelector('#app'))


// setTimeout(() => {
//   debugger
//   renderer.render(el2, document.querySelector('#app'))
// }, 2000)




// const bol = ref(false)

// effect(() => {
//   // 创建 vnode
//   const vnode = {
//     type: 'div',
//     props: bol.value ? {
//       onClick: () => {
//         alert('父元素 clicked')
//       }
//     } : {},
//     children: [
//       {
//         type: 'p',
//         props: {
//           onClick: () => {
//             bol.value = true
//           }
//         },
//         children: 'text'
//       }
//     ]
//   }
//   // 渲染 vnode
//   renderer.render(vnode, document.querySelector('#app'))
// })



/* 注释节点 */
// const vnode = {
//   type: Comment,
//   children: '我是注释'
// }
// // 渲染 vnode
// renderer.render(vnode, document.querySelector('#app'))


/* 碎片节点 */
const vnode = {
  type: 'ul',
  children: [
    {
      type: Fragment,
      children: [
        { type: 'li', children: '1' },
        { type: 'li', children: '2' },
        { type: 'li', children: '3' }
      ]
    }
  ]
}
// 渲染 vnode
renderer.render(vnode, document.querySelector('#app'))



/*  */
