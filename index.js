#!/usr/bin/env node
const chalk = require('chalk');
const replace = require('replace-in-file');
const log = console.log;
const { exec } = require('child_process');


// Welcome
log(chalk.yellow.bold(`===========================================
Welcome to the Digipolis React starter kit!
===========================================`));


// React
installReact();

function installReact() {
	log(chalk.green.bold('Installing React...'));
	exec('npx create-react-app frontend', (err, stdout, stderr) => {
		if (err) {
			log(chalk.bold.red('Oops!'));
			log(chalk.red(err));
			return;
		}
		log(chalk.blue('Done'));

		// ACPaaS UI
		installACPaaSUI()
	});
}

function installACPaaSUI() {
	log(chalk.green.bold('Installing ACPaaS UI...'));
	exec('cd frontend && npm install --save-dev node-sass && npm install --save @acpaas-ui/react-components @a-ui/core', (err, stdout, stderr) => {
		if (err) {
			log(chalk.bold.red('Oops!'));
			log(chalk.red(err));
			return;
		}
		log(chalk.blue('Done'));

		// Templates
		createStarterTemplate();
	});
}

function createStarterTemplate() {
	log(chalk.green.bold('Creating starter template...'));
	const options = {
		files: 'frontend/public/index.html',
		from: /<link rel="manifest"/g,
		to: `<link rel="stylesheet" href="https://cdn.antwerpen.be/core_branding_scss/3.0.3/main.min.css">
    <link rel="stylesheet" href="https://cdn.antwerpen.be/core_flexboxgrid_scss/1.0.1/flexboxgrid.min.css">
    <link rel="manifest"`,
	};
	replace(options, (err, changes) => {
		if (err) {
			log(chalk.bold.red('Oops!'));
			log(chalk.red(err));
			return;
		}

		// Delete files
		copyFiles();
	});

}

function copyFiles() {
	exec(`cp -R ${__dirname}/files/* frontend`, (err, stdout, stderr) => {
		if (err) {
			log(chalk.bold.red('Oops!'));
			log(chalk.red(err));
			exec('cwd');
			return;
		}
		log(chalk.blue('Done'));

		// Done
		log(chalk.white.bold('Now run ' + chalk.cyan.bold('npm start') + ' in your frontend directory.'));
	});
}

// To do:
// - cleanup
// - async
// - survey
// - Extra functionality
