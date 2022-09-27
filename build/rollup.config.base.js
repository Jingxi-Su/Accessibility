const rollup = require('rollup');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const { babel } = require('@rollup/plugin-babel');
const rollupTS = require('@rollup/plugin-typescript');
const path = require('path');
const { SRC_PATH, DIST_PATH, ES_DIST_PATH } = require('./path');
const { terser } = require('rollup-plugin-terser');

function getPlugins(isProduction, outputFormat) {
  const plugins = [
    nodeResolve(),
    rollupTS({
      exclude: [/node_modules/],
      tsconfig: outputFormat === 'es' ? './tsconfig.json' : './tsumdconfig.json'
    }),
    babel({
      babelHelpers: 'runtime',
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      exclude: [/node_modules/],
    }),
  ];
  if (isProduction) {
    // plugins.push(terser({ format: { comments: false } }));
  }

  return plugins;
}

module.exports = {
  getBaseEsConfig(options) {
    const { isProduction } = options;

    return {
      // rollup会将top level的this直接变成undefined
      context: 'this',
      input: {
        index: path.join(SRC_PATH, 'index.ts'),
      },
      output: {
        chunkFileNames: 'chunk-[name].js',
        entryFileNames: '[name].js',
        format: 'es',
        dir: ES_DIST_PATH,
        sourcemap: !isProduction,
        strict: true,
      },
      plugins: getPlugins(isProduction, 'es'),
    };
  },
  getBaseUmdConfig(options) {
    const { isProduction } = options;

    return {
      // rollup会将top level的this直接变成undefined
      context: 'this',
      input: {
        index: path.join(SRC_PATH, 'index.ts'),
      },
      output: {
        chunkFileNames: 'chunk-[name].js',
        entryFileNames: '[name].js',
        format: 'umd',
        name: '[name].js',
        dir: DIST_PATH,
        sourcemap: !isProduction,
        strict: true,
      },
      plugins: getPlugins(isProduction, 'umd'),
    };
  },
};
