const { log } = console;
const chalk = require('chalk');

class Debugger {
  constructor() {
    this.debug = false;
  }

  logger(logline) {
    if (this.debug) {
      log(chalk`{cyan.bold DEBUG: ${logline}}`);
    }
  }

  enable() {
    this.debug = true;
  }

  disable() {
    this.debug = false;
  }
}

const instance = new Debugger();

module.exports = instance;
