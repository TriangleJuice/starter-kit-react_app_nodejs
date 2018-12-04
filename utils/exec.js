const { spawn } = require('child_process');

function execPromise(command, options = []) {
	return new Promise(function(resolve, reject) {
		const child = spawn(command, options, { stdio: 'inherit' });

		child.on('data', data => console.log(data));
		child.on('close', resolve);
		child.on('error', error => reject(error));
	});
}

module.exports.execPromise = execPromise;
