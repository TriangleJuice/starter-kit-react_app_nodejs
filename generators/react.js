const chalk = require('chalk');
const replace = require('replace-in-file');

const { log } = console;
const { copyFolderRecursiveSync } = require('../utils/copy');
const { deleteFolderSync } = require('../utils/delete');
const { execPromise } = require('../utils/exec');
const { showError } = require('../utils/error');
const { mapRouting, routingReplaceOptions, asyncForEach } = require('../utils/routing');
const frontEndConfig = require('../config/front-end.config');

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
    await execPromise('npm', ['install', '--prefix', './frontend', '--save', '@acpaas-ui/react-components'].concat(config.branding.npm).concat(config.routing.npm));
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
    await copyFolderRecursiveSync(`${__basedir}/files/public`, __frontenddir);
    await copyFolderRecursiveSync(`${__basedir}/files/src`, __frontenddir);
    if (config.routing.add) {
      await asyncForEach(routingReplaceOptions, async (option) => {
        await replace(option);
      })
    } else {
      await deleteFolderSync('frontend/src/components/About');
    }
    log(chalk.blue('Done'));
  } catch (e) {
    showError(e);
  }
}

async function start(config) {
  config.routing = mapRouting(config.routing);
  log(chalk.green.bold('Preparing...'));
  try {
    await deleteFolderSync('frontend');
    await installReact(config);
    await installACPaaSUI(config);
    await createStarterTemplate(config);
  } catch (e) {
    showError(e);
  }
}

module.exports = {
  start,
};
