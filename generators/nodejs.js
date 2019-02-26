const { log } = console;
const chalk = require('chalk');
const inquirer = require('inquirer');
const gitclone = require('../utils/gitclone');
const { nodeConfig } = require('../config/back-end.config');
const { copyJob, copyFolderRecursiveSync, deleteFolderRecursive } = require('../utils/copy');

const questions = [
  {
    type: 'list',
    name: 'db',
    message: 'Which DB would you like?',
    choices: [
      { value: 'mongodb', name: 'MongoDB' },
      { value: 'postgres', name: 'Postgres' },
      { value: undefined, name: 'I don`t need a database' },
    ],
  },
  {
    type: 'list',
    name: 'testingFramework',
    message: 'Which testing framework would you like?',
    choices: [
      { value: 'mocha', name: 'Mocha' },
      { value: 'jest', name: 'Jest' },
    ],
  },
];

function getQuestions() {
  return questions;
}

async function copyBaseProject(){
  const { baseProject } = nodeConfig;
  const { repository, branch } = baseProject;
  log(chalk`{blue 🔗 Clone backend verion: {yellow.bold ${branch}}}`);
  await gitclone(repository, branch);
  log(chalk`Copy files form repo.`);
  const copyJobs = [
    { source: `./tmp/backend`, destination: './', type: 'folder' },
    { source: `./tmp/.digipolis.json`, destination: './', type: 'file' },
    { source: `./tmp/docker-compose.ci.yml`, destination: './', type: 'file' },
    { source: `./tmp/docker-compose.yml`, destination: './', type: 'file' },
    { source: `./tmp/Dockerfile`, destination: './', type: 'file' },
  ];
  await copyJob(copyJobs);
  log(chalk`{green Done. }`);
  log(chalk`Cleanup tmp folder.`);
  deleteFolderRecursive('./tmp');
  log(chalk`{green Done. }`);
}

async function start(options) {
  log(chalk`
------------------------------------------------
------------- {yellow.bold 🔨 Setup node.js} -----------------
------------------------------------------------
`);

  let backedOptions =  options;
  try{
    await copyBaseProject();
    log(chalk`
------------------------------------------------
---------- {yellow.bold ✅ Setup node.js done} ---------------
------------------------------------------------
`);
  } catch (e) {
  log(chalk`
------------------------------------------------
--------- {red.bold ❗️ Setup node.js failed} --------------
------------------------------------------------
`);
    log('error:', e );
  }
}

module.exports = {
  start,
  getQuestions,
};
