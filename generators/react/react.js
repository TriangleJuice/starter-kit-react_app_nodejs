const chalk = require('chalk');
const path = require('path');
const replace = require('replace-in-file');

const { log } = console;
const { copyFolderRecursiveSync } = require('../../utils/copy');
const { deleteFolderSync, deleteFileSync } = require('../../utils/delete');
const { execPromise } = require('../../utils/exec');
const { updateLog, errorLog } = require('../../utils/log');
const { mapBranding, brandings } = require('../../utils/branding');
const { mapRouting, routingReplaceOptions, loginReplaceOptions, loginRoutingReplaceOptions, asyncForEach } = require('./routing');
const frontEndConfig = require('../../config/front-end.config');

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

/**
 * Run the create-react-app command.
 * Install NPM dependencies.
 */

async function installReact(config) {
  updateLog('Installing React...');

  try {
    await execPromise('npx', ['create-react-app', 'frontend']);
    if (config.backend) {
      deleteFolderSync('frontend/.git');
    }
  } catch (e) {
    errorLog(e);
  }
}

/**
 * Go into frontend folder and install ACPaaS UI related stuff:
 * - ACPaaS UI (React).
 * - Core Branding and optionally one of the other brandings.
 * - Node SASS, so you don't have to rely on CSS only.
 */
async function installACPaaSUI(config) {
  updateLog('Installing ACPaaS UI...');

  try {
    await execPromise('npm', ['install', '--save-dev', 'node-sass'], { cwd: path.resolve('frontend') });
    await execPromise('npm', ['install', '--save', '@acpaas-ui/react-components'].concat(config.branding.npm).concat(config.routing.npm), {
      cwd: path.resolve('frontend'),
    });
  } catch (e) {
    errorLog(e);
  }
}

/**
 * Adjust the generated `index.html` file to include:
 * - Core Branding.
 * - Flexbox grid.
 * Merge our ready-made files with the files created by Create React App.
 */

async function createStarterTemplate(config) {
  updateLog('Creating starter template...');
  const branding = await frontEndConfig.branding.generateLinkTag(config.branding);

  const brandingReplaceOptions = [
    {
      files: './frontend/public/index.html',
      from: /x.x.x/g,
      to: config.branding.version,
    },
  ];

  if (config.name !== 'Starter app') {
    brandingReplaceOptions.push(
      {
        files: './frontend/public/index.html',
        from: /Starter app/g,
        to: config.name,
      },
      {
        files: './frontend/src/App.js',
        from: /Starter app/g,
        to: config.name,
      },
    );
  }

  if (config.branding.type !== 'core') {
    brandingReplaceOptions.push(
      {
        files: './frontend/public/index.html',
        from: /core_branding/g,
        to: 'digipolis_branding',
      },
      {
        files: './frontend/public/index.html',
        from: /safari-pinned-tab.svg" color="#cf0039"/g,
        to: 'safari-pinned-tab.svg" color="#347ea6"',
      },
      {
        files: './frontend/public/index.html',
        from: /msapplication-TileColor" content="#cf0039"/g,
        to: 'msapplication-TileColor" content="#5fb1d6"',
      },
      {
        files: './frontend/public/index.html',
        from: /theme-color" content="#cf0039"/g,
        to: 'theme-color" content="#ffffff"',
      },
    );
  }

  if (config.branding.type === 'acpaas') {
    brandingReplaceOptions.push({
      files: './frontend/public/index.html',
      from: /digipolis_branding_scss/g,
      to: 'acpaas_branding_scss',
    });
  }

  // Flexboxgrid
  if (config.flexboxgrid) {
    brandingReplaceOptions.push({
      files: './frontend/public/index.html',
      from: /main.min.css">/g,
      to: `main.min.css">
    ${frontEndConfig.flexbox.link}`,
    });
  }

  try {
    deleteFolderSync('frontend/public');
    await copyFolderRecursiveSync(`${__basedir}/files/public`, __frontenddir);
    await copyFolderRecursiveSync(`${__basedir}/files/src`, __frontenddir);

    await asyncForEach(brandingReplaceOptions, async (option) => {
      await replace(option);
    });

    if (config.routing.add) {
      await asyncForEach(routingReplaceOptions, async (option) => {
        await replace(option);
      });
    } else {
      deleteFolderSync('frontend/src/components/About');
    }

    if (config.auth) {
      if (config.routing.add) {
        await asyncForEach(loginRoutingReplaceOptions, async (option) => {
          await replace(option);
        });
      } else {
        await asyncForEach(loginReplaceOptions, async (option) => {
          await replace(option);
        });
      }
    } else {
      deleteFileSync('frontend/src/setupProxy.js');
      deleteFolderSync('frontend/src/components/Login');
    }
  } catch (e) {
    errorLog(e);
  }
}

async function start(config) {
  const configuration = Object.assign({}, config);
  configuration.routing = mapRouting(configuration);
  updateLog('Preparing...');
  try {
    deleteFolderSync('frontend');
    await installReact(configuration);
    await installACPaaSUI(configuration);
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
