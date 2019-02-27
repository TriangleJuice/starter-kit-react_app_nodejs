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

module.exports = fancyLog;
