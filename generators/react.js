const chalk = require('chalk');
const replace = require('replace-in-file');

const { log } = console;
const { copyFolderRecursiveSync, deleteFile } = require('../utils/copy');
const { deleteFolderSync } = require('../utils/delete');
const { execPromise } = require('../utils/exec');
const { showError } = require('../utils/error');
const { mapBranding, brandings } = require('../utils/branding');
const { mapRouting, routingReplaceOptions, loginRoutingReplaceOptions, asyncForEach } = require('../utils/routing');
const frontEndConfig = require('../config/front-end.config');

const options = [
  {
    param: '-b, --branding <branding>',
    description: 'Branding (Antwerp, Digipolis or ACPaaS)',
    validation: /^(Antwerp|Digipolis|ACPaaS)$/i,
    fallback: 'Antwerp',
  },
  {
    param: '-F, --no-flexboxgrid',
    description: 'Don\'t use the Flexbox grid',
  },
  {
    param: '-R, --no-routing',
    description: 'Don\'t add basic routing',
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
];

function getQuestions(auth) {
  if (!auth) {
    questions.push({
      type: 'confirm',
      name: 'routing',
      message: 'Do you want to add basic routing?',
      default: true,
    });
  }
  return questions;
}

function getOptions(auth) {
  return options;
}

/**
 * Run the create-react-app command.
 * Install NPM dependencies.
*/

async function installReact() {
  log(chalk.green.bold('Installing React...'));

  try {
    await execPromise('npx', ['create-react-app', 'frontend']);
  } catch (e) {
    showError(e);
  }
}

/**
 * Go into frontend folder and install ACPaaS UI related stuff:
 * - ACPaaS UI (React).
 * - Core Branding and optionally one of the other brandings.
 * - Node SASS, so you don't have to rely on CSS only.
 */
async function installACPaaSUI(config) {
  log(chalk.green.bold(`
Installing ACPaaS UI...`));

  try {
    await execPromise('npm', ['install', '--prefix', './frontend', '--save-dev', 'node-sass']);
    await execPromise('npm', ['install', '--prefix', './frontend', '--save', '@acpaas-ui/react-components']
      .concat(config.branding.npm).concat(config.routing.npm));
    log(chalk.blue(`
Done`));
  } catch (e) {
    showError(e);
  }
}

/**
 * Adjust the generated `index.html` file to include:
 * - Core Branding.
 * - Flexbox grid.
 * Merge our ready-made files with the files created by Create React App.
 */

async function createStarterTemplate(config) {
  log(chalk.green.bold('Creating starter template...'));
  const branding = await frontEndConfig.branding.generateLinkTag(config.branding);
  const flexboxGrid = config.flexboxgrid ? frontEndConfig.flexbox.link : '';

  const brandingReplaceOption = {
    files: 'frontend/public/index.html',
    from: /<link rel="manifest"/g,
    to: `${branding}
    ${flexboxGrid}
    <link rel="manifest"`,
  };

  try {
    await replace(brandingReplaceOption);

    await copyFolderRecursiveSync(`${__basedir}/files/src`, __frontenddir);

    if (config.routing.add) {
      await asyncForEach(routingReplaceOptions, async (option) => {
        await replace(option);
      });
    } else {
      await deleteFolderSync('frontend/src/components/About');
    }

    if (config.auth) {
      await asyncForEach(loginRoutingReplaceOptions, async (option) => {
        await replace(option);
      });
    } else {
      await deleteFile('frontend/src/setupProxy.js');
    }
    log(chalk.blue('Done'));
  } catch (e) {
    showError(e);
  }
}

async function start(config) {
  const configuration = Object.assign({}, config);
  configuration.routing = mapRouting(configuration);
  log(chalk.green.bold('Preparing...'));
  try {
    await deleteFolderSync('frontend');
    await installReact(configuration);
    await installACPaaSUI(configuration);
    await createStarterTemplate(configuration);
  } catch (e) {
    showError(e);
  }
}

module.exports = {
  getOptions,
  getQuestions,
  start,
};
