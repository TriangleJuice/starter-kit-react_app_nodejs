const { log } = console;
const path = require('path');
const chalk = require('chalk');
const replace = require('replace-in-file');

const { nodeConfig } = require('../../config/back-end.config');
const { copyJob } = require('../../utils/copy');
const debug = require('../../utils/debug');
const { deleteFileSync, deleteFolderRecursive } = require('../../utils/delete');
const { execPromise } = require('../../utils/exec');
const gitclone = require('../../utils/gitclone');
const { updateLog, errorLog } = require('../../utils/log');
const removeMatchedLines = require('../../utils/removeLine');

const generatorOptions = [
  {
    param: '-d, --database <database>',
    description: 'Database (MongoDB or none)',
    validation: /^(mongodb)$/i,
    fallback: 'mongodb',
  },
  {
    param: '-A, --no-auth',
    description: "Don't add basic authentication",
  },
];
const questions = [
  {
    type: 'list',
    name: 'database',
    message: 'Which database would you like?',
    choices: [{ value: 'mongodb', name: 'MongoDB' }, { value: undefined, name: "I don't need a database" }],
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

async function copyBaseProject(config) {
  const { baseProject } = nodeConfig;
  const { repository, tag } = baseProject;
  debug.logger(`Clone backend version: ${tag}`);
  await gitclone(repository, tag);
  debug.logger('Copy files from repo');
  if (config.frontend) {
    debug.logger('Enable Frontend in Dockerfile.');
    await replace({
      files: './tmp/Dockerfile',
      from: ['# RUN npm install', '# RUN npm run build'],
      to: ['RUN npm install', 'RUN npm run  build'],
    });
  }
  const copyJobs = [
    { source: './tmp/.digipolis.json', destination: './', type: 'file' },
    { source: './tmp/CHANGELOG.md', destination: './', type: 'file' },
    { source: './tmp/Dockerfile', destination: './', type: 'file' },
    { source: './tmp/README.md', destination: './', type: 'file' },
    { source: './tmp/backend', destination: './', type: 'folder' },
    { source: './tmp/.editorconfig', destination: './', type: 'file' },
    { source: './tmp/docker-compose.ci.yml', destination: './', type: 'file' },
    { source: './tmp/docker-compose.yml', destination: './', type: 'file' },
  ];
  await copyJob(copyJobs);
  debug.logger('Cleanup tmp folder');
  deleteFolderRecursive('./tmp');
}

async function setDB(db) {
  if (db === 'mongodb') {
    updateLog('Installing MongoDB...');
    debug.logger('MongoDB is the default. Nothing to replace');
  } else {
    debug.logger('Remove DB files');
    deleteFileSync(`${__backenddir}/src/helpers/db.helper.js`);
    deleteFileSync(`${__backenddir}/src/routes/example.router.js`);
    debug.logger('remove db references');
    deleteFolderRecursive(`${__backenddir}/src/models`);
    await removeMatchedLines(`${__backenddir}/src/app.js`, 'initializeDatabase');
    await removeMatchedLines(`${__backenddir}/src/routes/api.router.js`, 'example');
    await removeMatchedLines(`${__backenddir}/package.json`, 'mongoose');
  }
}

async function setAuth(auth) {
  if (auth) {
    updateLog('Adding M-profile authentication...');
    debug.logger('Auth is included. Nothing to replace');
  } else {
    debug.logger('Remove Auth files');
    deleteFileSync(`${__backenddir}/src/routes/auth.router.js`);
    debug.logger('remove auth references');
    deleteFolderRecursive(`${__backenddir}/src/models`);
    await removeMatchedLines(`${__backenddir}/src/routes/index.js`, 'setupAuthRoutes');
    await removeMatchedLines(`${__backenddir}/package.json`, '@digipolis/auth');
  }
}

async function installPackages() {
  await execPromise('npm', ['install'], { cwd: path.resolve(__backenddir) });
}

async function start(options) {
  updateLog('Setting up Node.js...');
  try {
    await copyBaseProject(options);
    await setDB(options.database);
    await setAuth(options.auth);
    await installPackages();
    log(
      chalk.cyan.bold('Done with BFF setup'),
    );
  } catch (e) {
    errorLog(e);
  }
}

export default {
  getOptions,
  getQuestions,
  start,
};
