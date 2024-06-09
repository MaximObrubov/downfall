import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import sass from 'rollup-plugin-sass';


export default {
  input: 'src/ts/downfall.ts',
  output: [
    // {
    //   file: 'dist/flipper.cjs.js',
    //   sourcemap: true,
    //   format: 'cjs'
    // },
    {
      file: 'dist/downfall.min.js',
      format: 'iife',
      name: 'Downfall',
      sourcemap: true,
      plugins: [terser()]
    }
  ],
  plugins: [
    typescript(),
    json(),
    sass({
      output: 'dist/downfall.css',
    }),
  ]
};
