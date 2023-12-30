module.exports = {
  // env 定义环境，每个环境都定义了一组预定义的全局变量
    "env": {
        "browser": true, // 可以使用浏览器环境中的全局变量
        "es2021": true  // 可以使用 es2021 环境中的全局变量
    },
    "extends": [
        "eslint:recommended", // 是 ESLint 官方的扩展,内置推荐规则
        "plugin:vue/vue3-essential"
    ],
    // 针对特定文件覆盖配置(下面详解)
    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                ".eslintrc.{js,cjs}"
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    // 指定你想要支持的 JavaScript 语言选项
    "parserOptions": {
      "ecmaFeatures": {
        "jsx": true,
      },
        "ecmaVersion": "latest", // 指定你想要使用的 ECMAScript 版本
        "sourceType": "module" //"script" (默认) 或 "module"（如果你的代码是 ECMAScript 模块)
    },
    // ESLint 支持使用第三方插件。在使用插件之前，你必须使用 npm 安装它。
    // 在配置文件里配置插件时，可以使用 plugins 关键字来存放插件名字的列表。插件名称可以省略 eslint-plugin- 前缀。
    "plugins": [
        "vue" // 使用了 eslint-plugin-vue 插件
    ],
    // 配置规则的地方 这里就是我们所需要配置的规则
    "rules": {
      'vue/no-mutating-props': 0,
      "vue/multi-word-component-names": 0
    }
}
