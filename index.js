#!/usr/bin/env node
const chalk = require('chalk');
const inquirer = require('inquirer');
const program = require('commander');
const requireDir = require('require-dir');

const generators = requireDir('./generators');
const pjson = require('./package.json');
const questions = require('./config/questions');
const options = require('./config/options');

const { log } = console;
const { mapBranding } = require('./utils/branding');
const fancyLog = require('./utils/fancyLog');
const debug = require('./utils/debug');

global.__basedir = __dirname;
global.__frontenddir = './frontend';
global.__backenddir = './backend';


// Run commander with generator options
options();

function finishInstallation() {
  log(chalk.white.bold(`Now run ${chalk.cyan.bold('npm start')} in your frontend directory.`));
}

async function askQuestions() {
  let config = await inquirer.prompt(questions);
  const { frontend, backend } = config;
  if (config.backend && generators[backend].getQuestions) {
    const backendConfig = await inquirer.prompt(generators[backend].getQuestions());
    config = Object.assign({}, config, backendConfig);
  }
  if (config.frontend && generators[frontend].getQuestions) {
    const frontendConfig = await inquirer.prompt(generators[frontend].getQuestions());
    config = Object.assign({}, config, frontendConfig);
  }
  return config;
}
/**
 * Go!
 * First check if the starter app was intended to run on its own.
 */
async function run() {
  fancyLog('blue.bold', `Welcome to the Digipolis starter kit! (v${pjson.version})`, '=');
  if (program.setup) {
    const config = await askQuestions();
    if (program.debug) {
      debug.enable();
    }
    const { frontend, backend } = config;

    if (frontend) await generators[frontend].start(config);
    if (backend) await generators[backend].start(config);

    finishInstallation();
  } else {
    program.branding = await mapBranding(program.branding);
    const config = program;
    config.noSetup = true;
    const { frontend, backend } = config;
    if (frontend) await generators[frontend].start(config);
    if (backend) await generators[backend].start(config);

    finishInstallation();
  }
}

run();
