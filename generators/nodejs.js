const { log } = console;
const chalk = require('chalk');
const gitclone = require('../utils/gitclone');
const fancyLog = require('../utils/fancyLog');
const debug = require('../utils/debug');
const { nodeConfig } = require('../config/back-end.config');
const removeMatchedLines = require('../utils/removeLine');
const { copyJob, deleteFile, deleteFolderRecursive } = require('../utils/copy');

const generatorOptions = [
  {
    param: '-t, --testing <testing>',
    description: 'Testing (Mocha or Jest)',
    validation: /^(mocha|jest)$/i,
    fallback: 'Mocha',
  },
  {
    param: '-d, --database <database>',
    description: 'Database (MongoDB or PostgreSQL)',
    validation: /^(mongodb|postgres)$/i,
    fallback: 'mongodb',
  },
  {
    param: '-A, --auth',
    description: 'Add basic /auth routing',
  },
];
const questions = [
  {
    type: 'list',
    name: 'db',
    message: 'Which DB would you like?',
    choices: [
      { value: 'mongodb', name: 'MongoDB' },
      { value: 'postgres', name: 'PostgreSQL' },
      { value: undefined, name: 'I don\'t need a database' },
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
  {
    type: 'confirm',
    name: 'auth',
    message: 'Do you want to use digipolis authentication?',
    default: true,
  },
];

function getQuestions() {
  return questions;
}

function getOptions() {
  return generatorOptions;
}

async function copyBaseProject() {
  const { baseProject } = nodeConfig;
  const { repository, branch } = baseProject;
  log(chalk`{blue 🔗 Clone backend verion: {yellow.bold ${branch}}}`);
  await gitclone(repository, branch);
  log(chalk`Copy files form repo.`);
  const copyJobs = [
    { source: './tmp/.digipolis.json', destination: './', type: 'file' },
    { source: './tmp/Dockerfile', destination: './', type: 'file' },
    { source: './tmp/README.md', destination: './', type: 'file' },
    { source: './tmp/backend', destination: './', type: 'folder' },
    { source: './tmp/.editorconfig', destination: './', type: 'file' },
    { source: './tmp/docker-compose.ci.yml', destination: './', type: 'file' },
    { source: './tmp/docker-compose.yml', destination: './', type: 'file' },
  ];
  await copyJob(copyJobs);
  log(chalk`{green Done. }`);
  log(chalk`Cleanup tmp folder.`);
  deleteFolderRecursive('./tmp');
  log(chalk`{green Done. }`);
}

async function setDB(db) {
  if (db === 'mongodb') {
    log(chalk`{yellow.bold Installing MongoDB }`);
    debug.logger('MongoDB is the default. Nothing to replace');
  } else {
    debug.logger('Remove DB files');
    deleteFile('./backend/src/helpers/db.helper.js');
    deleteFile('./backend/src/routes/example.router.js');
    debug.logger('remove db references');
    deleteFolderRecursive('./backend/src/models');
    await removeMatchedLines('./backend/src/app.js', 'initializeDatabase');
    await removeMatchedLines('./backend/src/routes/api.router.js', 'example');
    await removeMatchedLines('./backend/package.json', 'mongoose');
  }
}

async function setAuth(auth) {
  if (auth) {
    log(chalk`{yellow.bold Installing Auth endpoints }`);
    debug.logger('Auth is included. Nothing to replace');
  } else {
    debug.logger('Remove Auth files');
    deleteFile('./backend/src/routes/auth.router.js');
    debug.logger('remove auth references');
    deleteFolderRecursive('./backend/src/models');
    await removeMatchedLines('./backend/src/routes/index.js', 'setupAuthRoutes');
    await removeMatchedLines('./backend/package.json', '@digipolis/auth');
  }
}
async function start(options) {
  fancyLog('yellow.bold', '🔨 Setup node.js');
  try {
    await copyBaseProject();
    await setDB(options.db);
    await setAuth(options.auth);
    fancyLog('yellow.bold', '✅ Setup node.js done');
  } catch (e) {
    fancyLog('red.bold', '❗️ Setup node.js failed');
    log('error:', e);
  }
}

module.exports = {
  getOptions,
  getQuestions,
  start,
};
