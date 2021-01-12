import brandings from '../../config/brandings.config';
import { mapBranding } from '../../utils/branding';

const path = require('path');
const replace = require('replace-in-file');
const async = require('async');

const debug = require('../../utils/debug');
const { copyFolderRecursiveSync } = require('../../utils/copy');
const { deleteFolderSync, deleteFileSync } = require('../../utils/delete');
const { execPromise } = require('../../utils/exec');
const { updateLog, errorLog } = require('../../utils/log');


const { mapRouting, getRoutingReplaceOptions, getLoginReplaceOptions, getLoginRoutingReplaceOptions } = require('./routing');
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

function getOptions() {
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
    await execPromise('npm', ['install', '--save-dev', 'node-sass@<5.0.0'], { cwd: path.resolve('frontend') });
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

  const IndexHtmlReplaceOptions = {
    files: `${__frontenddir}/public/index.html`,
    from: [/Starter app/g, 'https://cdn.antwerpen.be/core_branding_scss/x.x.x/main.min.css'],
    to: [config.name, `https://cdn.antwerpen.be/${config.branding.cdn}/${config.branding.version}/main.min.css`],
  };

  const AppJsReplaceOptions = {
    files: `${__frontenddir}/src/App.js`,
    from: [/Starter app/g],
    to: [config.name],
  };

  const AppJsNextReplaceOptions = {
    files: `${__frontenddir}/src/App.js`,
    from: ['logoAlt="{{BRANDING_NAME}} logo." logoSrc="https://cdn.antwerpen.be/{{BRANDING_TYPE}}_branding_scss/{{BRANDING_VERSION}}/assets/images/{{BRANDING_LOGO}}'],
    to: [`logoAlt="${config.branding.key} logo." logoSrc="https://cdn.antwerpen.be/${config.branding.type}_branding_scss/${config.branding.version}/assets/images/${config.branding.logo}`],
  };

  if (config.branding.type !== 'core') {
    IndexHtmlReplaceOptions.from.push(
      /safari-pinned-tab.svg" color="#cf0039"/g,
      /msapplication-TileColor" content="#cf0039"/g,
      /theme-color" content="#cf0039"/g,
    );
    IndexHtmlReplaceOptions.to.push(
      'safari-pinned-tab.svg" color="#347ea6"',
      'msapplication-TileColor" content="#5fb1d6"',
      'theme-color" content="#ffffff"',
    );
  }

  // Flexboxgrid
  if (config.flexboxgrid) {
    IndexHtmlReplaceOptions.from.push(/main.min.css">/g);
    IndexHtmlReplaceOptions.to.push(`main.min.css">
    ${frontEndConfig.flexbox.link}`);
  }

  try {
    deleteFolderSync('frontend/public');
    await copyFolderRecursiveSync(`${__basedir}/generators/react/files/public`, __frontenddir);
    await copyFolderRecursiveSync(`${__basedir}/generators/react/files/src`, __frontenddir);

    await replace({
      files: `${__frontenddir}/src/App.scss`,
      from: [/styles\/quarks';/],
      to: [
        `/styles/quarks';
${config.branding.scss.join('\n')}`,
      ],
    });

    await replace(IndexHtmlReplaceOptions);
    await replace(AppJsReplaceOptions);

    if (config.routing.add) {
      await async.each(getRoutingReplaceOptions(), async (option) => {
        await replace(option);
      });
    } else {
      deleteFolderSync('frontend/src/components/About');
    }

    if (config.auth) {
      if (config.routing.add) {
        await async.each(getLoginRoutingReplaceOptions(), async (option) => {
          await replace(option);
        });
      } else {
        await async.each(getLoginReplaceOptions(), async (option) => {
          await replace(option);
        });
      }
    } else {
      deleteFileSync('frontend/src/setupProxy.js');
      deleteFolderSync('frontend/src/components/Login');
    }

    await replace(AppJsNextReplaceOptions);
  } catch (e) {
    errorLog(e);
  }
}

async function prepareConfiguration(config) {
  return {
    ...config,
    routing: mapRouting(config),
    branding: await config.branding,
  };
}

async function start(config) {
  updateLog('Preparing...');
  const configuration = await prepareConfiguration(config);
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

export default {
  getOptions,
  getQuestions,
  start,
  prepareConfiguration,
};
