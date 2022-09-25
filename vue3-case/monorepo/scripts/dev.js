
const {resolve} = require('path')
const {build} = require('esbuild')
// 获取命令行参数
const args = require('minimist')(process.argv.slice(2))
// console.log(args,'args') // { _: [ 'reactivity' ], f: 'global' }

// 打包目标
const target = args._[0] || 'reactivity'
// 目标文件格式
const format = args.f || 'global'

//入口文件
const entry = resolve(__dirname,`../packages/${target}/src/index.ts`)

// 打包的模块的package.json
const pkg = require(resolve(__dirname,`../packages/${target}/package.json`));

// iife 自执行函数：(function(){})()
// cjs common.js规范
// esm es6Module

// 打包后输出的文件格式
const outputFormat = format.startsWith('global') ? 'iife': format==='cjs' ? 'cjs': 'esm'
// 打包后输出的文件
const outfile = resolve(__dirname,`../packages/${target}/dist/${target}.${format}.js`)

// console.log(outfile,entry,outputFormat,format)

// 天生就支持ts
build({
    entryPoints: [entry],
    outfile,
    bundle: true, // 把所有的包全部打包到一起
    sourcemap: true,
    format: outputFormat,// 输出的格式
    globalName: pkg.buildOptions?.name, // 打包的全局的名字
    platform: format === 'cjs' ? 'node' : 'browser', // 平台
    watch: { // 监控文件变化
        onRebuild(error) {
            if (!error) console.log(`rebuilt~~~~`)
        }
    }
}).then(() => {
    console.log('watching~~~')
})