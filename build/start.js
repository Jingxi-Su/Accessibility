const rollup = require('rollup');
const fs = require('fs');
const codeFrame = require('babel-code-frame');
const { getBaseEsConfig, getBaseUmdConfig } = require('./rollup.config.base');
const { DIST_PATH, ES_DIST_PATH } = require('./path');
const rimraf = require('rimraf');
const chalk = require('chalk');

// Errors in promises should be fatal.
let loggedErrors = new Set();
process.on('unhandledRejection', (err) => {
  if (loggedErrors.has(err)) {
    // No need to print it twice.
    process.exit(1);
  }
  throw err;
});

function handleRollupError(error) {
  loggedErrors.add(error);
  if (!error.code) {
    console.error(error);
    return;
  }
  console.error(`\x1b[31m-- ${error.code}${error.plugin ? ` (${error.plugin})` : ''} --`);
  console.error(error.stack);
  if (error.loc && error.loc.file) {
    const { file, line, column } = error.loc;
    // This looks like an error from Rollup, e.g. missing export.
    // We'll use the accurate line numbers provided by Rollup but
    // use Babel code frame because it looks nicer.
    const rawLines = fs.readFileSync(file, 'utf-8');
    // column + 1 is required due to rollup counting column start position from 0
    // whereas babel-code-frame counts from 1
    const frame = codeFrame(rawLines, line, column + 1, {
      highlightCode: true,
    });
    console.error(frame);
  } else if (error.codeFrame) {
    // This looks like an error from a plugin (e.g. Babel).
    // In this case we'll resort to displaying the provided code frame
    // because we can't be sure the reported location is accurate.
    console.error(error.codeFrame);
  }
}

function handleRollupWarning(warning) {
  if (typeof warning.code === 'string') {
    // This is a warning coming from Rollup itself.
    // These tend to be important (e.g. clashes in namespaced exports)
    // so we'll fail the build on any of them.
    console.error();
    console.error(warning.message || warning);
    console.error();
  } else {
    // The warning is from one of the plugins.
    // Maybe it's not important, so just print it.
    console.warn(warning.message || warning);
  }
}

async function buildEverything() {
  // production | development
  const env = process.env.NODE_ENV;
  const isProduction = env === 'production';
  console.log(chalk.bgWhite.black(`env: ${env}\n`));
  const esconfig = getBaseEsConfig({
    isProduction,
  });
  const umdconfig = getBaseUmdConfig({
    isProduction,
  });

  if (isProduction) {
    console.log(`${chalk.bgYellow.black(' BUILDING ')}\n`);
    try {
      const bundle = await rollup.rollup({
        ...esconfig,
        onwarn: handleRollupWarning,
      });

      await bundle.write(esconfig.output);

      const bundle2 = await rollup.rollup({
        ...umdconfig,
        onwarn: handleRollupWarning,
      });

      await bundle2.write(umdconfig.output);
    } catch (error) {
      console.log(`${chalk.bgRed.black(' OH NOES! ')}\n`);
      handleRollupError(error);
      throw error;
    }
    console.log(`${chalk.bgGreen.black(' COMPLETE ')}\n`);
  } else {
    const watcher = rollup.watch({
      ...config,
      onwarn: handleRollupWarning,
      watch: {
        clearScreen: true,
      },
    });
    watcher.on('event', async (event) => {
      switch (event.code) {
        case 'BUNDLE_START':
          console.log(`${chalk.bgYellow.black(' BUILDING ')}\n`);
          break;
        case 'BUNDLE_END':
          console.log(`${chalk.bgGreen.black(' COMPLETE ')}\n`);
          break;
        case 'ERROR':
        case 'FATAL':
          console.log(`${chalk.bgRed.black(' OH NOES! ')}\n`);
          handleRollupError(event.error);
          break;
      }
    });
  }
}

function clear() {
  console.log(`${chalk.bgGreenBright.black(' CLEARING ')}\n`);
  const p1 = new Promise((resolve, reject) => {
    rimraf(DIST_PATH, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
  const p2 = new Promise((resolve, reject) => {
    rimraf(ES_DIST_PATH, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });

  return Promise.all([p1, p2]);
}

async function main() {
  await clear();
  buildEverything();
}

main();
