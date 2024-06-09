import config from "./rollup.config.js";
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'

export default {
  ...config,
  output: [
    {
      file: 'dist/downfall.js',
      format: 'iife',
      name: 'Downfall',
      sourcemap: true,
    }
  ],
  plugins: [
    ...config.plugins,
    serve(), // index.html should be in root of project
    livereload(),
  ]
}
