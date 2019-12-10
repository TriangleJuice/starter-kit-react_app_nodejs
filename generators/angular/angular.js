import * as fs from 'fs';
import * as path from 'path';
import options from './config/options';
import questions from './config/questions';
import { updateLog, errorLog } from '../../utils/log';
import { execPromise } from '../../utils/exec';
import { mapRouting } from './routing';
import { deleteFolderSync } from '../../utils/delete';
import { updatePackageJson, getlatestverion } from '../../utils/package';
import { copyFolderRecursiveSync, copyFileSync } from '../../utils/copy';
import AngularTemplateGenerator from './template-generator';

import overwriteAndRename from '../../utils/overwrite';


function getQuestions() {
  return questions;
}

function getOptions() {
  return options;
}

const generator = new AngularTemplateGenerator();

/**
 * Run the angular-cli new command.
 * Install NPM dependencies.
 */
async function installAngular(config) {
  updateLog('Installing Angular...');
  try {
    await execPromise('npx', [
      '-p',
      '@angular/cli',
      'ng',
      'new',
      'frontend',
      `--skipGit=${!!config.backend}`,
      '--style=scss',
      `--routing=${!!config.routing.add}`,
    ]);
    await execPromise('npm', ['install', '--save', 'rxjs'], { cwd: path.resolve('frontend') });
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
  const coreVersion = await getlatestverion('@a-ui/core');
  updateLog(`Creating starter template (v.${coreVersion})...`);

  // src/proxy.conf.js
  if (config.backend) {
    copyFileSync(`${__basedir}/generators/angular/files/proxy.conf.js`, `${__frontenddir}`);
    updatePackageJson(
      {
        scripts: {
          start: 'ng serve --proxy-config proxy.conf.js',
        },
      },
      `${__frontenddir}/package.json`,
    );
  }

  // First copy all files necessary, we'll compile the templates later on
  copyFolderRecursiveSync(`${__basedir}/generators/angular/files/src/app`, `${__frontenddir}/src`);
  copyFileSync(`${__basedir}/generators/angular/files/src/index.html.template.hbs`, `${__frontenddir}/src`);
  copyFileSync(`${__basedir}/generators/angular/files/src/styles.scss.template.hbs`, `${__frontenddir}/src`);

  // src/index.html
  await overwriteAndRename(
    path.resolve(__frontenddir, 'src/index.html.template.hbs'),
    path.resolve(__frontenddir, 'src/index.html'),
    async () => generator.generateIndexFile(config),
  );

  // src/styles.scss
  await overwriteAndRename(
    path.resolve(__frontenddir, 'src/styles.scss.template.hbs'),
    path.resolve(__frontenddir, 'src/styles.scss'),
    async () => generator.generateStyles(config),
  );

  // app.module.ts
  await overwriteAndRename(
    path.resolve(__frontenddir, 'src/app/app.module.ts.template.hbs'),
    path.resolve(__frontenddir, 'src/app/app.module.ts'),
    async () => generator.generateAppModule(config),
  );

  // app.component.html
  await overwriteAndRename(
    path.resolve(__frontenddir, 'src/app/app.component.html.template.hbs'),
    path.resolve(__frontenddir, 'src/app/app.component.html'),
    async () => generator.generateAppComponentTemplate({
      ...config,
      coreVersion,
    }),
  );

  // app.component.ts
  await overwriteAndRename(
    path.resolve(__frontenddir, 'src/app/app.component.ts.template.hbs'),
    path.resolve(__frontenddir, 'src/app/app.component.ts'),
    async () => generator.generateAppComponentTs(config),
  );

  if (config.routing && config.routing.add) {
    await copyFolderRecursiveSync(`${__basedir}/generators/angular/files/extra/src/app/pages/`, `${__frontenddir}/src/app`);
    await copyFolderRecursiveSync(`${__basedir}/generators/angular/files/extra/src/app/services`, `${__frontenddir}/src/app`);
    copyFileSync(`${__basedir}/generators/angular/files/extra/src/app/app-routing.module.ts.template.hbs`, `${__frontenddir}/src/app`);
    if (!config.auth) {
      deleteFolderSync(`${__frontenddir}/src/app/pages/login`);
    } else {
      // Auth is enabled
      await copyFolderRecursiveSync(`${__basedir}/generators/angular/files/extra/src/app/pages/login/`, `${__frontenddir}/src/app/pages`);
      await copyFolderRecursiveSync(`${__basedir}/generators/angular/files/extra/src/app/services`, `${__frontenddir}/src/app`);
    }

    // src/app/pages/index.ts
    await overwriteAndRename(
      path.resolve(__frontenddir, 'src/app/pages/index.ts.template.hbs'),
      path.resolve(__frontenddir, 'src/app/pages/index.ts'),
      async () => generator.generatePagesIndex(config),
    );

    // src/app/app-routing.module.ts
    await overwriteAndRename(
      path.resolve(__frontenddir, 'src/app/app-routing.module.ts.template.hbs'),
      path.resolve(__frontenddir, 'src/app/app-routing.module.ts'),
      async () => generator.generateRoutingModule(config),
    );
  }
}

async function start(config) {
  const configuration = Object.assign({}, config);
  configuration.routing = mapRouting(configuration);
  updateLog('Preparing...');
  try {
    deleteFolderSync('frontend');
    fs.mkdirSync('frontend');
    await installAngular(configuration);
    await installACPaasUI(configuration);
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
};
