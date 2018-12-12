const { spawn } = require('child_process');

function execPromise(command, options = []) {
	return new Promise(function(resolve, reject) {
		let child;
		if (!/^win/.test(process.platform)) { // linux
			child = spawn(command, options, { stdio: 'inherit' });
		} else { // windows
			child = spawn('cmd', ['/s', '/c', command].concat(options), { stdio: 'inherit' });
		}

		child.on('data', data => console.log(data));
		child.on('close', resolve);
		child.on('error', error => reject(error));
	});
}

module.exports.execPromise = execPromise;
