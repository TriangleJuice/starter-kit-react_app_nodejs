const chalk = require('chalk');

const { log } = console;

function showError(error) {
  log(chalk.bold.red('Oops!'));
  log(chalk.red(error));
}

module.exports.showError = showError;
