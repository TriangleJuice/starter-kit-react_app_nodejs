import * as fs from 'fs';
import * as path from 'path';
import options from './config/options';
import questions from './config/questions';
import { updateLog, errorLog } from '../../utils/log';
import { execPromise } from '../../utils/exec';
import { mapRouting } from './routing';
import { deleteFolderSync, deleteFileSync } from '../../utils/delete';
import { updatePackageJson, getlatestverion } from '../../utils/package';
import { copyFolderRecursiveSync, copyFileSync } from '../../utils/copy';
import HandlebarsTemplateGenerator from '../../utils/template-generator';

import overwriteAndRename from '../../utils/overwrite';


function getQuestions() {
  return questions;
}

function getOptions() {
  return options;
}

class AngularAppGenerator {
  constructor(configuration) {
    this.configuration = configuration;
  }

  async start() {
    updateLog('Preparing...');
    this.configuration = {
      ...this.configuration,
      routing: mapRouting(this.configuration),
      coreVersion: await getlatestverion('@a-ui/core')
    };
    await this.prepareDirectory();
    await this.installAngular(this.configuration);
    await this.installACPaasUI(this.configuration);
    await this.createStarterTemplate(this.configuration);
    updateLog('Done with front-end setup', 'cyan');
  }

  async prepareDirectory() {
    deleteFolderSync(__frontenddir);
    return new Promise((resolve, reject) => fs.mkdir(__frontenddir, (err) => err ? reject(err) : resolve()));
  }

  /**
 * Run the angular-cli new command.
 * Install NPM dependencies.
 */
  async installAngular(config) {
    updateLog('Installing Angular...');
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
  }

  /**
 * Go into frontend folder and install ACPaaS UI related stuff:
 * - ACPaaS UI (Angular).
 * - Core Branding and optionally one of the other brandings.
 * - Node SASS, so you don't have to rely on CSS only.
 */
  async installACPaasUI(config) {
    updateLog('Installing ACPaaS UI...');
    await execPromise('npm', ['install', '--save-dev', 'node-sass'], { cwd: path.resolve('frontend') });
    await execPromise('npm', ['install', '--save', '@acpaas-ui/ngx-components'].concat(config.branding.npm).concat(config.routing.npm), {
      cwd: path.resolve('frontend'),
    });
  }

  async createStarterTemplate(config) {
    const generator = new HandlebarsTemplateGenerator(config);
    updateLog(`Creating starter template (v.${config.coreVersion})...`);

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
    await generator.generate({
      fromTemplate: path.resolve(__frontenddir, 'src/index.html.template.hbs'),
      to: path.resolve(__frontenddir, 'src/index.html')
    });
    updateLog('CREATED: index.html');

    // src/styles.scss
    await generator.generate({
      fromTemplate: path.resolve(__frontenddir, 'src/styles.scss.template.hbs'),
      to: path.resolve(__frontenddir, 'src/styles.scss')
    });
    updateLog('CREATED: styles.scss');

    // app.module.ts
    await generator.generate({
      fromTemplate: path.resolve(__frontenddir, 'src/app/app.module.ts.template.hbs'),
      to: path.resolve(__frontenddir, 'src/app/app.module.ts'),
    });
    updateLog('CREATED: app.module.ts');

    // app.component.html
    await generator.generate({
      fromTemplate: path.resolve(__frontenddir, 'src/app/app.component.html.template.hbs'),
      to: path.resolve(__frontenddir, 'src/app/app.component.html')
    });
    updateLog('CREATED: app.component.html');

    // app.component.ts
    await generator.generate({
      fromTemplate: path.resolve(__frontenddir, 'src/app/app.component.ts.template.hbs'),
      to: path.resolve(__frontenddir, 'src/app/app.component.ts'),
    });
    updateLog('CREATED: app.component.ts');

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
      await generator.generate({
        fromTemplate: path.resolve(__frontenddir, 'src/app/pages/index.ts.template.hbs'),
        to: path.resolve(__frontenddir, 'src/app/pages/index.ts'),
      });
      updateLog('CREATED: pages/index.ts');

      // src/app/app-routing.module.ts
      await generator.generate({
        fromTemplate: path.resolve(__frontenddir, 'src/app/app-routing.module.ts.template.hbs'),
        to: path.resolve(__frontenddir, 'src/app/app-routing.module.ts'),
      });
      updateLog('CREATED: app-routing.module.ts');
    } else {
      await copyFolderRecursiveSync(
        path.resolve(__basedir, 'generators/angular/files/extra/src/app/pages'),
        path.resolve(__frontenddir, 'src/app/')
      );
      deleteFolderSync(path.resolve(__frontenddir, 'src/app/pages/about'));
      deleteFolderSync(path.resolve(__frontenddir, 'src/app/pages/login'));
      deleteFolderSync(path.resolve(__frontenddir, 'src/app/pages/index.ts.template.hbs'));
    }
  }

}

export default {
  getOptions,
  getQuestions,
  start: (config) => {
    const generator = new AngularAppGenerator(config);
    return generator.start();
  },
  AngularAppGenerator
};
