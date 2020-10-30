import babel from 'rollup-plugin-babel'
import serve from 'rollup-plugin-serve'

export default {
  input: './src/index.js',
  output: {
    file: 'dist/vue.js',
    name: 'Vue',  // 生成包的名称
    format: 'umd', // 打包的格式
    sourcemap: true
  },
  plugins: [
    babel({
      exclude: 'node_modules/**'
    }),
    serve({
      open: true, // 自动启动浏览器
      openPage: '/public/index.html', // 浏览器打开的页面
      port: 3000,
      contentBase: ""
    })
  ]
}