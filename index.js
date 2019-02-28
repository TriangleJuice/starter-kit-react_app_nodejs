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
global.__frontenddir = `./frontend`;
global.__backenddir = `./backend`;
/**
 * Define command flags
 */
program
  .version(pjson.version)
  .usage('[options]')
  .option('-b, --branding <branding>', 'Branding (Antwerp, Digipolis or ACPaaS)', /^(antwerp|digipolis|acpaas)$/i, 'Antwerp')
  .option('-F, --no-flexboxgrid', 'Don\'t use the Flexbox grid')
  .option('-R, --no-routing', 'Don\'t add basic routing')
  .option('-S, --no-setup', 'Skip setup questions')
  .option('-f, --frontend <frontend>', 'Frontend framework (React or Angular)', /^(react|angular)$/i, 'React')
  .option('-b, --backend <backend>', 'Backend framework (Node.js, .NET Core or none)', /^(nodejs|dotnet)$/i, 'Node.js')
  .option('-t, --testing <testing>', 'Testing (Mocha or Jest)', /^(mocha|jest)$/i, 'Mocha')
  .option('-d, --database <database>', 'Database (MongoDB or PostgreSQL)', /^(mongodb|postgres)$/i, 'MongoDB')
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
