import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import nodePolyfills from 'rollup-plugin-polyfill-node'
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import babel from '@rollup/plugin-babel';
//import { terser } from 'rollup-plugin-terser';

import { chromeExtension, simpleReloader } from 'rollup-plugin-chrome-extension'

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
	input: 'src/scripts/content-script.js',
	output: {
		file: 'dist/scripts/content-script.js',
		format: 'iife'
	},
	plugins: [
		resolve(),
		commonjs(),
		json()
	]
}

/*
export default {
	input: 'src/manifest.json',
	output: {
	  dir: 'dist',
	  format: 'esm',
	  esModule: 'false'
	},
	plugins: [
	  // always put chromeExtension() before other plugins
	  chromeExtension(),
	  simpleReloader(),
	  // the plugins below are optional
	  nodePolyfills(),
	  resolve({ browser: true, preferBuiltins: false }),
	  commonjs({include: [ "node_modules/**" ], transformMixedEsModules: true}),
	  babel({exclude: "node_modules/**"}),
	  json(),
	  replace({
		'Object.defineProperty(exports, "__esModule", { value: true });': '',
		delimiters: ['\n', '\n']
	  }),
	],
  }
*/