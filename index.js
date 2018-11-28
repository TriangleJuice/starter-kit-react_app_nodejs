#!/usr/bin/env node
const { exec } = require('child_process');

console.log('Welcome to the Digipolis React starter kit');

exec('npx create-react-app frontend', (err, stdout, stderr) => {
	if (err) {
		console.log(err);
		return;
	}
	console.log(stdout);
});
