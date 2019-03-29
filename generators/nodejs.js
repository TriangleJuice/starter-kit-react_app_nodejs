const { log } = console;
const chalk = require('chalk');
const { nodeConfig } = require('../config/back-end.config');
const { copyJob } = require('../utils/copy');
const debug = require('../utils/debug');
const { deleteFile, deleteFolderRecursive } = require('../utils/delete');
const { execPromise } = require('../utils/exec');
const gitclone = require('../utils/gitclone');
const { updateLog, errorLog } = require('../utils/log');
const removeMatchedLines = require('../utils/removeLine');

const generatorOptions = [
  {
    param: '-d, --database <database>',
    description: 'Database (MongoDB or none)',
    validation: /^(mongodb)$/i,
    fallback: 'mongodb',
  },
  {
    param: '-A, --no-auth',
    description: 'Don\'t add basic authentication',
  },
];
const questions = [
  {
    type: 'list',
    name: 'database',
    message: 'Which database would you like?',
    choices: [
      { value: 'mongodb', name: 'MongoDB' },
      { value: undefined, name: 'I don\'t need a database' },
    ],
  },
  {
    type: 'confirm',
    name: 'auth',
    message: 'Do you want your app to include Digipolis authentication?',
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
  debug.logger(`Clone backend version: ${branch}`);
  // log(chalk`{blue 🔗 Clone backend version: {yellow.bold ${branch}}}`);
  await gitclone(repository, branch);
  debug.logger(`Copy files from repo`);
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
  debug.logger(`Cleanup tmp folder`);
  deleteFolderRecursive('./tmp');
}

async function setDB(db) {
  if (db === 'mongodb') {
    updateLog('Installing MongoDB...');
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
    updateLog('Adding M-profile authentication...');
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

async function installPackages() {
  await execPromise('npm', ['install', '--prefix', './backend']);
}

async function start(options) {
  updateLog('Setting up Node.js...');
  try {
    await copyBaseProject();
    await setDB(options.database);
    await setAuth(options.auth);
    await installPackages();
    log(chalk.cyan.bold(`
Done with BFF setup`));
  } catch (e) {
    showError(e);
  }
}

module.exports = {
  getOptions,
  getQuestions,
  start,
};
