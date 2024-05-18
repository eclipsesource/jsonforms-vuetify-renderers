import vue from '@vitejs/plugin-vue';
import babel from '@rollup/plugin-babel';
import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import cleanup from 'rollup-plugin-cleanup';
import { visualizer } from 'rollup-plugin-visualizer';
import postcss from 'rollup-plugin-postcss';

import packageJson from './package.json' assert { type: 'json' };

const baseConfig = {
  input: 'src/index.ts',
  external: [
    ...Object.keys(packageJson.dependencies),
    ...Object.keys(packageJson.peerDependencies),
    /^lodash\/.*/,
    'vuetify/components',
    '@mdi/font',
    /^dayjs\/.*/,
  ],
};

const buildFormats = [
  {
    ...baseConfig,
    output: {
      file: packageJson.module,
      format: 'esm',
      sourcemap: true,
      assetFileNames: '[name][extname]',
    },
    plugins: [
      resolve({
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.mts', '.vue'],
      }),
      vue(),
      postcss({
        extensions: ['.css', '.scss'],
        extract: true,
      }),
      typescript({
        emitDeclarationOnly: true,
        tsconfig: 'tsconfig.compile.json',
      }),
      babel({
        exclude: 'node_modules/**',
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
        babelHelpers: 'bundled',
      }),
      cleanup({ extensions: ['js', 'ts', 'jsx', 'tsx', 'vue'] }),
      visualizer(),
    ],
  },
  {
    ...baseConfig,
    output: {
      file: packageJson.main,
      format: 'cjs',
      sourcemap: true,
      assetFileNames: '[name][extname]',
    },
    plugins: [
      resolve({
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.mts', '.vue'],
      }),
      vue(),
      postcss({
        extensions: ['.css', '.scss'],
        extract: `${packageJson.module.split('/')[1].split('.')[0]}.cjs.css`,
      }),
      typescript({
        emitDeclarationOnly: true,
        tsconfigOverride: {
          target: 'ES5',
        },
        tsconfig: 'tsconfig.compile.json',
      }),
      babel({
        exclude: 'node_modules/**',
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
        babelHelpers: 'bundled',
      }),
      cleanup({ extensions: ['js', 'ts', 'jsx', 'tsx', 'vue'] }),
    ],
  },
];

export default buildFormats;
