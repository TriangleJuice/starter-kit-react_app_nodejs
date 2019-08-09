const path = require('path');
const fs = require('fs');
const util = require('util');
const replace = require('replace-in-file');
const async = require('async');

const { updateLog, errorLog } = require('../../utils/log');
const { deleteFolderSync } = require('../../utils/delete');
const { mapBranding, brandings } = require('../../utils/branding');
const frontEndConfig = require('../../config/front-end.config');
const { execPromise } = require('../../utils/exec');

const appendFile = util.promisify(fs.appendFile);

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

function getOptions() {
  return options;
}

/**
 * Run the angular-cli new command.
 * Install NPM dependencies.
 */
async function installAngular(config) {
  updateLog('Installing Angular...');
  try {
    await execPromise('npm', ['i', '-g', '@angular/cli']);
    // TODO: Handle angular cli question for routing
    await execPromise('ng', ['new', 'frontend', `--skipGit=${!!config.backend}`, '--style=scss']);
  } catch (e) {
    errorLog(e);
  }
}

/**
 * Go into frontend folder and install ACPaaS UI related stuff:
 * - ACPaaS UI (Angular).
 * - Core Branding and optionally one of the other brandings.
 * - Node SASS, so you don't have to rely on CSS only.
 */
async function installACPaasUI(config) {
  updateLog('Installing ACPaaS UI...');

  try {
    await execPromise('npm', ['install', '--save-dev', 'node-sass'], { cwd: path.resolve('frontend') });
    await execPromise('npm', ['install', '--save', '@acpaas-ui/ngx-components'], {
      cwd: path.resolve('frontend'),
    });
  } catch (e) {
    errorLog(e);
  }
}

async function createStarterTemplate(config) {
  updateLog('Creating starter template...');

  const brandingReplaceOptions = [];

  brandingReplaceOptions.push(
    {
      files: './frontend/src/index.html',
      from: /<title>Frontend<\/title>/g,
      to: `<title>${config.name}</title>`,
    },
    {
      files: './frontend/src/app/app.component.ts',
      from: /frontend/g,
      to: config.name,
    },
  );

  if (config.flexboxgrid) {
    brandingReplaceOptions.push({
      files: './frontend/src/index.html',
      from: /favicon.ico">/g,
      to: `/favicon.ico">
    ${frontEndConfig.flexbox.link}`,
    });
  }

  try {
    await appendFile(
      './frontend/src/styles.scss',
      `@import url('https://cdn.antwerpen.be/${config.branding.cdn}/${config.branding.version}/main.min.css');`,
    );

    await async.eachSeries(brandingReplaceOptions, async (option) => {
      await replace(option);
    });

      // TODO: Routing
      // TODO: auth
  } catch (e) {
    errorLog(e);
  }
}

async function start(config) {
  const configuration = Object.assign({}, config);
  updateLog('Preparing...');
  try {
    deleteFolderSync('frontend');
    await installAngular(configuration);
    await installACPaasUI(configuration);
    await createStarterTemplate(configuration);
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
