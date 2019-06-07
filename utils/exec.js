const { spawn } = require('child_process');

function execPromise(command, options = [], spawnOptions = {}) {
  return new Promise(((resolve, reject) => {
    let child;
    if (!/^win/.test(process.platform)) { // linux
      child = spawn(command, options, { stdio: 'inherit', ...spawnOptions });
    } else { // windows
      child = spawn('cmd', ['/s', '/c', command].concat(options), { stdio: 'inherit', ...spawnOptions });
    }

    child.on('data', data => console.log(data));
    child.on('close', resolve);
    child.on('error', error => reject(error));
  }));
}

module.exports.execPromise = execPromise;
