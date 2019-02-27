#!/usr/bin/env node
const chalk = require('chalk');
const inquirer = require('inquirer');
const program = require('commander');
const requireDir = require('require-dir');

const generators = requireDir('./generators');
const pjson = require('./package.json');
const questions = require('./config/questions');

const { log } = console;
const { mapBranding } = require('./utils/branding');

global.__basedir = __dirname;
global.__frontenddir = `${__dirname}/frontend`;
global.__backenddir = `${__dirname}/backend`;
/**
 * Define command flags
 */
program
  .version(pjson.version)
  .usage('[options]')
  .option('-b, --branding <branding>', 'Branding (Antwerp, Digipolis or ACPaaS)', /^(antwerp|digipolis|acpaas)$/i, 'Antwerp')
  .option('-F, --no-flexboxgrid', 'Don\'t use the Flexbox grid')
  .option('-S, --no-setup', 'Skip setup questions')
  .option('-f, --frontend <frontend>', 'frontend')
  .option('-b, --backend <backend>', 'backend')
  .option('-t, --tesing <testing>', 'testing mocha|jest')
  .option('-d, --database <database>', 'database mongodb|postgres')
  .parse(process.argv);

/**
 * Clean up and finish installation.
 */
function finishInstall() {
  log(chalk.white.bold(`Now run ${chalk.cyan.bold('npm start')} in your frontend directory.`));
}

/**
 * Go!
 * First check if the starter app was intended to run on its own.
 */
async function run() {
  log(chalk.blue.bold(`==============================================
Welcome to the Digipolis starter kit! (v${pjson.version})
==============================================`));
  if (program.setup) {
    const config = await inquirer.prompt(questions);
    const { frontend, backend } = config;
    await generators[frontend].start(config);
    if (backend) {
      await generators[backend].start(config);
    }
    finishInstall();
  } else {
    program.branding = mapBranding(program.branding);
    const config = program;
    config.noSetup = true;
    const { frontend, backend } = config;
    await generators[frontend].start(config);
    if (backend) {
      await generators[backend].start(config);
    }
    finishInstall();
  }
}

run();
