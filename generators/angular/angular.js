/**
 * Main generator file for generating Angular projects.
 */
import * as fs from 'fs';
import * as path from 'path';
import replace from 'replace-in-file';
import options from './config/options';
import questions from './config/questions';
import { updateLog } from '../../utils/log';
import { execPromise } from '../../utils/exec';
import { mapRouting } from './helpers/routing';
import { deleteFolderSync } from '../../utils/delete';
import { updatePackageJson, getlatestverion } from '../../utils/package';
import { copyFolderRecursiveSync, copyFileSync } from '../../utils/copy';
import HandlebarsTemplateGenerator from '../../utils/template-generator';

function getQuestions() {
  return questions;
}

function getOptions() {
  return options;
}

class AngularAppGenerator {
  /**
   * @param configuration Configuration object
   * @param execCallback Callback used for executing command on the child process spawn
   * @param templateGenerator Instance of HandlebarsTemplateGenerator
   */
  constructor(configuration, execCallback, templateGenerator) {
    this.execPromise = execCallback;
    this.configuration = configuration;
    this.generator = templateGenerator;
  }

  async start() {
    updateLog('Preparing...');
    await this.prepareDirectory();
    await this.installAngular(this.configuration);
    await this.installACPaasUI(this.configuration);
    await this.createStarterTemplate(this.configuration);
    updateLog('Done with frontend setup', 'cyan');
  }

  /**
   * Deletes & recreates the frontend directory (if present)
   * The method won't crash if no frontend directory is present.
   */
  async prepareDirectory() {
    deleteFolderSync(__frontenddir);
    return new Promise((resolve, reject) => fs.mkdir(__frontenddir, err => (err ? reject(err) : resolve())));
  }

  /**
   * Creates a new application by invoking the @angular/cli new command.
   * Additionaly a git and routing config is added if necessary
   * @param Configuration config
   */
  async installAngular(config) {
    updateLog('Installing Angular...');
    await this.execPromise('npx', [
      '-p',
      '@angular/cli',
      'ng',
      'new',
      'frontend',
      `--skipGit=${!!config.backend}`,
      '--style=scss',
      `--routing=${!!config.routing.add}`,
      '--strict=false',
    ]);
  }


  /**
   * Installs necessary ACPaas UI libraries:
   * - ACPaas UI
   * - SASS
   */
  async installACPaasUI(config) {
    updateLog('Installing ACPaaS UI...');
    await this.execPromise('npm', ['install', '--save-dev', 'node-sass'], { cwd: path.resolve(__frontenddir) });
    await this.execPromise('npm', ['install', '--save', '@acpaas-ui/ngx-components', ...config.branding.npm, ...config.routing.npm], {
      cwd: path.resolve(__frontenddir),
    });
  }

  /**
   * Compiles and renders template files and copies necessary files for a complete
   * angular app setup. THis method does the actual method of generating the project.
   */
  async createStarterTemplate(config) {
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
    await this.generator.generate({
      fromTemplate: path.resolve(__frontenddir, 'src/index.html.template.hbs'),
      to: path.resolve(__frontenddir, 'src/index.html'),
    });
    updateLog('CREATED: index.html');

    // src/styles.scss
    await this.generator.generate({
      fromTemplate: path.resolve(__frontenddir, 'src/styles.scss.template.hbs'),
      to: path.resolve(__frontenddir, 'src/styles.scss'),
    });

    updateLog('CREATED: styles.scss');

    // app.module.ts
    await this.generator.generate({
      fromTemplate: path.resolve(__frontenddir, 'src/app/app.module.ts.template.hbs'),
      to: path.resolve(__frontenddir, 'src/app/app.module.ts'),
    });
    updateLog('CREATED: app.module.ts');

    // app.component.html
    await this.generator.generate({
      fromTemplate: path.resolve(__frontenddir, 'src/app/app.component.html.template.hbs'),
      to: path.resolve(__frontenddir, 'src/app/app.component.html'),
    });
    updateLog('CREATED: app.component.html');

    // app.component.ts
    await this.generator.generate({
      fromTemplate: path.resolve(__frontenddir, 'src/app/app.component.ts.template.hbs'),
      to: path.resolve(__frontenddir, 'src/app/app.component.ts'),
    });
    updateLog('CREATED: app.component.ts');

    // AUI module
    await copyFolderRecursiveSync(
      path.resolve(__basedir, 'generators/angular/files/src/app/aui'),
      path.resolve(__frontenddir, 'src/app/'),
    );

    // aui-imports.ts
    await this.generator.generate({
      fromTemplate: path.resolve(__frontenddir, 'src/app/aui/aui.imports.ts.template.hbs'),
      to: path.resolve(__frontenddir, 'src/app/aui/aui.imports.ts'),
    });
    updateLog('CREATED: aui.module.ts');

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
      await this.generator.generate({
        fromTemplate: path.resolve(__frontenddir, 'src/app/pages/index.ts.template.hbs'),
        to: path.resolve(__frontenddir, 'src/app/pages/index.ts'),
      });
      updateLog('CREATED: pages/index.ts');

      // src/app/app-routing.module.ts
      await this.generator.generate({
        fromTemplate: path.resolve(__frontenddir, 'src/app/app-routing.module.ts.template.hbs'),
        to: path.resolve(__frontenddir, 'src/app/app-routing.module.ts'),
      });
      updateLog('CREATED: app-routing.module.ts');
    } else {
      await copyFolderRecursiveSync(
        path.resolve(__basedir, 'generators/angular/files/extra/src/app/pages'),
        path.resolve(__frontenddir, 'src/app/'),
      );
      deleteFolderSync(path.resolve(__frontenddir, 'src/app/pages/about'));
      deleteFolderSync(path.resolve(__frontenddir, 'src/app/pages/login'));
      deleteFolderSync(path.resolve(__frontenddir, 'src/app/pages/index.ts.template.hbs'));
    }
  }
}

/**
 * Dependency injection is used here for testing purposes.
 * However, to prevent to start reworking the whole application,
 * we imply with the export default interface that is also present in other
 * generator files.
 */
export default {
  getOptions,
  getQuestions,
  start: async (config) => {
    const configuration = {
      ...config,
      routing: mapRouting(config),
      coreVersion: await getlatestverion('@a-ui/core'),
    };
    const generator = new AngularAppGenerator(configuration, execPromise, new HandlebarsTemplateGenerator(configuration));
    return generator.start();
  },
  AngularAppGenerator,
};
