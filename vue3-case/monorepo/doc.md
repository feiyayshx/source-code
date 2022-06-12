# 基于monorepo搭建vue3源码项目开发环境

本章学习的知识点：
- 掌握monorepo管理项目。
- 掌握pnpm依赖包管理。
- 了解vue3源码各个模块负责的功能。

## monorepo

## pnpm

## Vue3项目模块介绍




## 搭建Vue3源码项目开发环境

vue3中，使用 pnpm workspace 搭建monorepo环境。npm不支持monorepo。

### 全局安装pnpm
```sh
# 全局安装pnpm, mac系统:命令行前面添加sudo;当前pnpm版本:7.2.1
npm install pnpm -g 
```

### 初始化package.json配置文件

创建monorepo文件夹作为项目目录名，初始化配置文件
```sh
# 初始化package.json配置文件
pnpm init 
```
### 创建packages目录

该目录下管理vue3开发的所有模块。

### 配置workspace

新建pnpm-workspace.yaml文件
```yaml
packages:
  - 'packages/*'
```
将packages下的所有目录都作为包进行管理。到这里monorepo环境就搭建好了!

### 创建.npmrc文件
```npmrc
shamefully-hoist = true
```
在创建npmrc之前，可以尝试安装vue3,执行pnpm install vue,命令行出现以下提示：
> Running this command will add the dependency to the workspace root, which might not be what you want - if you really meant it, make it explicit by running this command again with the -w flag (or --workspace-root). If you don't want to see this warning anymore, you may set the ignore-workspace-root-check setting to true.

大概意思是pnpm会将依赖添加到根目录，如果确定，在命令行后面添加-w来执行。此时我们再次执行pnpm install vue -w 来安装vue3。

依赖下载后打开node_modules可以发现，只有一个vue模块，其他依赖的模块都在.pnpm中管理。这是pnpm包管理的优化，为了解决幽灵依赖问题。

如果我们不想要这种方式，想和npm效果保持一致，这里可以配置shamefully-hoist = true，添加羞耻的提升可以将Vue3所依赖的模块提升到node_modules中。

### TypeScript类型校验

**下载依赖**
| 依赖  | 说明 |
| ---------- | ----------------------- |	
| typescript | 支持typescript           |
| minimist	 | 命令行参数解析            |
| esbuild	 | 开发环境打包           |


```sh
pnpm install typescript minimist esbuild -w -D
```
**初始化tsconfig.json文件**

根目录下添加tsconfig.json文件，执行下面一条命令即可。
```sh
pnpm tsc --init
```
**添加tsconfig.json 常用配置**
```json
{
  "compilerOptions": {
    "outDir": "dist", // 输出的目录
    "sourceMap": true, // 采用sourcemap
    "target": "es2016", // 目标语法
    "module": "esnext", // 模块格式
    "moduleResolution": "node", // 模块解析方式
    "strict": false, // 严格模式
    "resolveJsonModule": true, // 解析json模块
    "esModuleInterop": true, // 允许通过es6语法引入commonjs模块
    "jsx": "preserve", // jsx 不转义
    "lib": ["esnext", "dom"], // 支持的类库 esnext及dom
  }
}
```

### 创建模块

### 开发环境esbuild打包

### 生产环境rollup打包

