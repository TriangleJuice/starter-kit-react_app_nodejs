const { updateLog, errorLog } = require('../../utils/log');
const { deleteFolderSync } = require('../../utils/delete');
const { mapBranding, brandings } = require('../../utils/branding');
const { execPromise } = require('../../utils/exec');

const options = [
  {
    param: '-b, --branding <branding>',
    description: 'Branding (Antwerp, Digipolis or ACPaaS)',
    validation: /^(Antwerp|Digipolis|ACPaaS)$/i,
    fallback: 'Antwerp',
  },
  {
    param: '-F, --no-flexboxgrid',
    description: "Don't use the Flexbox grid",
  },
  {
    param: '-R, --no-routing',
    description: "Don't add basic routing",
  },
];

const questions = [
  {
    type: 'list',
    name: 'branding',
    message: 'Which branding do you want to use?',
    choices: Object.keys(brandings),
    filter: mapBranding,
  },
  {
    type: 'confirm',
    name: 'flexboxgrid',
    message: 'Do you want to use the Flexbox grid?',
    default: true,
  },
  {
    type: 'confirm',
    name: 'routing',
    message: 'Do you want to add basic routing?',
    default: true,
  },
];

function getQuestions() {
  return questions;
}

function getOptions(auth) {
  return options;
}

async function installAngular(config) {
  updateLog('Installing Angular...');
  try {
    await execPromise('npm', ['i', '-g', '@angular/cli']);
    await execPromise('ng', ['new', 'frontend']);
    if (config.backend) {
      deleteFolderSync('frontend/.git');
    }
  } catch (e) {
    errorLog(e);
  }
}

async function installACPaasUI() {}

async function createStarterTemplate() {}

async function start(config) {
  const configuration = Object.assign({}, config);
  updateLog('Preparing...');
  try {
    deleteFolderSync('frontend');
    await installAngular(configuration);
    // await installACPaasUI(configuration);
    // await createStarterTemplate(configuration);
    updateLog('Done with front-end setup', 'cyan');
  } catch (e) {
    errorLog(e);
  }
}

module.exports = {
  getOptions,
  getQuestions,
  start,
};
