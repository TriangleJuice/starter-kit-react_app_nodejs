#!/usr/bin/env node
const chalk = require('chalk');
const inquirer = require('inquirer');
const replace = require('replace-in-file');
const log = console.log;
const { exec } = require('child_process');

var config = {};


// Welcome
log(chalk.yellow.bold(`===========================================
Welcome to the Digipolis React starter kit!
===========================================`));

const questions = [
	{
	    type: 'list',
	    name: 'branding',
	    message: 'Which branding do you want to use?',
	    choices: ['Antwerp', 'Digipolis', 'ACPaaS'],
	    filter: function(val) {
	    	switch(val) {
	    		case 'ACPaaS': return {cdn: 'acpaas_branding_scss', npm: '@a-ui/core @a-ui/acpaas', version: '3.0.3', type: 'acpaas' };
	    		case 'Digipolis': return {cdn: 'digipolis_branding_scss', npm: '@a-ui/core @a-ui/digipolis', version: '3.0.2', type: 'digipolis' };
	    		default: return {cdn: 'core_branding_scss', npm: '@a-ui/core', version: '3.0.3', type: 'core' };
	    	}
	    }
	},
]

query(questions);

function query(questions) {
	inquirer.prompt(questions).then(answers => {
		config = answers;
		// log(config);
		installReact();
	});
}

// React
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
	exec(`cd frontend && npm install --save-dev node-sass && npm install --save @acpaas-ui/react-components ${config.branding.npm}`, (err, stdout, stderr) => {
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
		to: `<link rel="stylesheet" href="https://cdn.antwerpen.be/${config.branding.cdn}/${config.branding.version}/main.min.css">
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
