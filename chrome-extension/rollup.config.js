import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

import { chromeExtension, simpleReloader } from 'rollup-plugin-chrome-extension'

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
	input: 'src/manifest.json',
	output: {
	  dir: 'dist',
	  format: 'esm',
	},
	plugins: [
	  // always put chromeExtension() before other plugins
	  chromeExtension(),
	  simpleReloader(),
	  // the plugins below are optional
	  resolve(),
	  commonjs(),
	],
  }