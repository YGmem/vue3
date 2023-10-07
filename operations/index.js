export const ProxyType = {
  DELETE: 'delete',
  ADD: 'add',
  SET: 'set'
}


export const ReactiveFlags = {
  RAW: '__v_raw',  // 访问代理的原始代理值
  SKIP: '__v_skip', 
  IS_REACTIVE: '__v_isReactive', // 是否reactive
  IS_READONLY: '__v_isReadonly', // 是否只读
  IS_SHALLOW: '__v_isShallow'  // 是否浅响应
}