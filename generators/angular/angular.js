const path = require('path');
const replace = require('replace-in-file');
const async = require('async');

const { updateLog, errorLog } = require('../../utils/log');
const { deleteFolderSync } = require('../../utils/delete');
const { updatePackageJson } = require('../../utils/package');
const { copyFolderRecursiveSync, copyFileSync } = require('../../utils/copy');
const { mapBranding, brandings } = require('../../utils/branding');
const frontEndConfig = require('../../config/front-end.config');
const { execPromise } = require('../../utils/exec');
const { mapRouting } = require('./routing');

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
    await execPromise('ng', ['new', 'frontend', `--skipGit=${!!config.backend}`, '--style=scss', `--routing=${!!config.routing}`]);
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
    await execPromise('npm', ['install', '--save', '@acpaas-ui/ngx-components'].concat(config.branding.npm).concat(config.routing.npm), {
      cwd: path.resolve('frontend'),
    });
  } catch (e) {
    errorLog(e);
  }
}

async function createStarterTemplate(config) {
  updateLog('Creating starter template...');

  const brandingReplaceOptions = {
    files: './frontend/src/index.html',
    from: [/<title>Frontend<\/title>/g, /<brand \/>/g],
    to: [
      `<title>${config.name}</title>`,
      `<link rel="stylesheet" href="https://cdn.antwerpen.be/${config.branding.cdn}/${config.branding.version}/main.min.css">`,
    ],
  };

  if (config.branding.type !== 'core') {
    brandingReplaceOptions.from.push(
      /safari-pinned-tab.svg" color="#cf0039"/g,
      /msapplication-TileColor" content="#cf0039"/g,
      /theme-color" content="#cf0039"/g,
    );
    brandingReplaceOptions.to.push(
      'safari-pinned-tab.svg" color="#347ea6"',
      'msapplication-TileColor" content="#5fb1d6"',
      'theme-color" content="#ffffff"',
    );
  }

  if (config.flexboxgrid) {
    brandingReplaceOptions.from.push(/main.min.css">/g);
    brandingReplaceOptions.to.push(`main.min.css">
    ${frontEndConfig.flexbox.link}`);
  }

  try {
    deleteFolderSync('frontend/src/app');
    await copyFolderRecursiveSync(`${__basedir}/generators/angular/files/src/app`, `${__frontenddir}/src`);
    await copyFolderRecursiveSync(`${__basedir}/generators/angular/files/src/assets`, `${__frontenddir}`);
    await copyFileSync(`${__basedir}/generators/angular/files/index.html`, `${__frontenddir}/src`);

    await replace(brandingReplaceOptions);

    if (config.backend) {
      copyFileSync(`${__basedir}/generators/angular/files/proxy.conf.json`, `${__frontenddir}`);
      updatePackageJson(
        {
          scripts: {
            start: 'ng serve --proxy-config proxy.conf.json',
          },
        },
        `${__frontenddir}/package.json`,
      );
    }

    if (config.auth) {
      // install rxjs
      // copy files/replace content
    }

    if (config.routing.add) {
      // copy files/replace content
    }
  } catch (e) {
    errorLog(e);
  }
}

async function start(config) {
  const configuration = Object.assign({}, config);
  configuration.routing = mapRouting(configuration);
  console.log(JSON.stringify(configuration, null, 2));
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
