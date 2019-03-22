// import rollup from "rollup";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import json from "rollup-plugin-json";
import babel from "rollup-plugin-babel";
import { eslint } from "rollup-plugin-eslint";
import { terser } from "rollup-plugin-terser";

const pkg = require("./package.json");

const banner = (function() {
  const row = [
    `Leaflet.CustomLayer.js v${pkg.version}`,
    "",
    "Copyright (c) 2019-present Derek Li",
    "Released under the MIT License - https://choosealicense.com/licenses/mit/",
    "",
    "https://github.com/iDerekLi/Leaflet.CustomLayer"
  ];
  return ["/*!", ...row.map(r => `* ${r}`), "*/"].join("\n ");
})();
function getBaseConfig() {
  const baseConfig = {
    input: "src/Leaflet.CustomLayer.js",
    plugins: [
      json(),
      resolve({
        jsnext: false, // 该属性是指定将Node包转换为ES2015模块
        // main 和 browser 属性将使插件决定将那些文件应用到bundle中
        main: true, // Default: true
        browser: true // Default: false
      }),
      commonjs(),
      eslint({
        include: "src/**",
        exclude: "node_modules/**",
        throwOnWarning: true
      }),
      babel({
        exclude: "node_modules/**"
      })
    ],
    external: ["leaflet"],
    watch: {
      include: "src/**",
      exclude: "node_modules/**"
    }
  };
  return baseConfig;
}

function TerserPlugin(minimizer) {
  return terser({
    ie8: true,
    keep_fnames: !minimizer, // 是否保持原变量名
    compress: {
      warnings: false,
      drop_console: false, // 删除所有的 `console` 语句，可以兼容ie浏览器
      reduce_vars: false // 内嵌定义了但是只用到一次的变量
    },
    output: {
      beautify: !minimizer, // 是否不进行压缩
      comments: minimizer ? /Leaflet.CustomLayer.js|Derek Li/ : true // 是否保留注释
    }
  });
}

export default ((name, options) => {
  const config = [];
  for (let type in options) {
    config.push(
      typeof options[type] === "function" && options[type](name, type)
    );
  }
  return config;
})("Leaflet.CustomLayer", {
  [""](name, type) {
    const config = Object.assign(getBaseConfig(), {
      output: {
        format: "umd",
        name: "Leaflet.CustomLayer",
        file: `dist/${name}.js`,
        banner,
        indent: true,
        legacy: true, // Needed to create files loadable by IE8
        sourcemap: true
      }
    });
    config.plugins.push(TerserPlugin(false));
    return config;
  },
  ["min"](name, type) {
    const config = Object.assign(getBaseConfig(), {
      output: {
        format: "umd",
        name: "Leaflet.CustomLayer",
        file: `dist/${name}.${type}.js`,
        banner,
        indent: true,
        legacy: true, // Needed to create files loadable by IE8
        sourcemap: true
      }
    });
    config.plugins.push(TerserPlugin(true));
    return config;
  },
  ["es"](name, type) {
    const config = Object.assign(getBaseConfig(), {
      output: {
        format: "es",
        file: `dist/${name}.esm.js`,
        banner,
        indent: true,
        legacy: true, // Needed to create files loadable by IE8
        sourcemap: true
      }
    });
    config.plugins.push(TerserPlugin(false));
    return config;
  }
});
