import { baseHandlers } from "../proxy/index.js"

export default function reactive(obj) {
  return new Proxy(obj, baseHandlers)
}