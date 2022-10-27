import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

import dts from "rollup-plugin-dts";
import external from "rollup-plugin-exclude-dependencies-from-bundle";
import postcss from "rollup-plugin-postcss";
import { terser } from "rollup-plugin-terser";

const packageJson = require("./package.json");

/**
 * @type {import('rollup').RollupOptions}
 */
const config = [
  {
    input: "src/index.tsx",
    output: [
      {
        file: packageJson.main,
        format: "cjs",
        sourcemap: true,
        name: "onboard-react",
      },
      {
        file: packageJson.module,
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [
      external({ peerDependencies: true, dependencies: true }),
      resolve(),
      commonjs(),
      typescript({ tsconfig: "./tsconfig.json" }),
      postcss({
        modules: {
          generateScopedName: "[hash:base64:8]",
        },
        autoModules: true,
        minimize: true,
      }),
      terser(),
    ],
  },
  {
    input: "dist/index.d.ts",
    output: [{ file: "dist/typings.d.ts", format: "esm" }],
    external: [/\.css$/],
    plugins: [dts()],
  },
];

export default config;
