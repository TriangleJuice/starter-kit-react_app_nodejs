const chalk = require('chalk');

const log = console.log;

function showError(error) {
    log(chalk.bold.red('Oops!'));
	log(chalk.red(error));
	return;
}

module.exports.showError = showError;
