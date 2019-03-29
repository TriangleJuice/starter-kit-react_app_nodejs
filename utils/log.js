const { log } = console;
const chalk = require('chalk');

function fancyLog(color, text, sign = '-') {
  const stringLength = text.length + 2;
  const beforeAfterLength = 14;
  const totalLength = stringLength + 2 * beforeAfterLength;
  log(chalk`${sign.repeat(totalLength)}`);
  log(chalk`${sign.repeat(beforeAfterLength)} {${color} ${text}} ${sign.repeat(beforeAfterLength)}`);
  log(chalk`${sign.repeat(totalLength)}`);
}

function updateLog(text, color = 'green') {
  log(chalk`
{${color}.bold ${text}}`);
}

function errorLog(error) {
  log(chalk.bold.red('Oops!'));
  log(chalk.red(error));
}

module.exports = {
  fancyLog,
  updateLog,
  errorLog,
};
