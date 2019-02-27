const { log } = console;
const chalk = require('chalk');
const inquirer = require('inquirer');


const questions = [
  {
    type: 'list',
    name: 'db',
    message: 'Which DB would you like?',
    choices: [
      { value: 'mongodb', name: 'MongoDB' },
      { value: 'postgres', name: 'PostgreSQL' },
      { value: undefined, name: 'I don\'t need a database' },
    ],
  },
  {
    type: 'list',
    name: 'testingFramework',
    message: 'Which testing framework would you like?',
    choices: [
      { value: 'mocha', name: 'Mocha' },
      { value: 'jest', name: 'Jest' },
    ],
  },
];

async function start(options) {
  let backedOptions =  options;
  if(!options.noSetup){
    const backendconfig = await inquirer.prompt(questions);
    backedOptions = { ...options, ...backendconfig };
  }
  log(chalk.green.bold('Node.js not yet implemented 🙄'));
}

module.exports = {
  start,
};
