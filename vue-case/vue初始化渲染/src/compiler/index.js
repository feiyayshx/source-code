
import { parseHTML } from './parse'
import { generate } from './generate'

export function compileToFunctions(template) {
  // 根据模版生成ast语法树
  let ast = parseHTML(template)

  // 根据ast 生成code代码
  let code = generate(ast)

  // 生成render 字符串
  let render = `with(this){ return ${code}}`

  // 将render字符串转为render函数

  let fn = new Function(render)

  return fn

}