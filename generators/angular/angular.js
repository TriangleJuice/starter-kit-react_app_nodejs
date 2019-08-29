const path = require('path');
const replace = require('replace-in-file');

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
    files: `${__frontenddir}/src/index.html`,
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
    deleteFolderSync(`${__frontenddir}/src/app`);
    await copyFolderRecursiveSync(`${__basedir}/generators/angular/files/src/app`, `${__frontenddir}/src`);
    copyFileSync(`${__basedir}/generators/angular/files/index.html`, `${__frontenddir}/src`);
    copyFileSync(`${__basedir}/generators/angular/files/styles.scss`, `${__frontenddir}/src`);

    await replace(brandingReplaceOptions);
    await replace({
      files: `${__frontenddir}/src/styles.scss`,
      from: [/styles\/quarks";/],
      to: [
        `/styles/quarks";
      ${config.branding.scss.join('\n')}`,
      ],
    });

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

    if (config.routing.add) {
      await copyFolderRecursiveSync(`${__basedir}/generators/angular/files/extra/src/app/pages/`, `${__frontenddir}/src/app`);
      deleteFolderSync(`${__frontenddir}/src/app/pages/login`);
      copyFileSync(`${__basedir}/generators/angular/files/extra/src/app/app-routing.module.ts`, `${__frontenddir}/src/app`);
      copyFileSync(`${__basedir}/generators/angular/files/extra/src/app/app.component.html`, `${__frontenddir}/src/app`);
      const replaceAppComponentHtml = {
        files: `${__frontenddir}/src/app/app.component.html`,
        from: [/<\/aui-header>/],
        to: [
          `<div auiHeaderMenuItem>
        <a routerLink="/home">
          <button class="a-button">
            <span>Home</span>
          </button>
        </a>
        <a routerLink="/about">
          <button class="a-button">
            <span>About</span>
          </button>
        </a>
      </div>
      </aui-header>`,
        ],
      };

      const replaceAppModule = {
        files: `${__frontenddir}/src/app/app.module.ts`,
        from: [/BrowserModule,/g, 'import { AuiModules } from "./aui.modules";', '[AppComponent]'],
        to: [
          `BrowserModule,
        AppRoutingModule,`,
          `import { AuiModules } from "./aui.modules";
        import { AppRoutingModule } from './app-routing.module';
        import { Pages } from './pages';`,
          '[AppComponent, ...Pages]',
        ],
      };

      await replace(replaceAppComponentHtml);
      await replace(replaceAppModule);
    }

    if (config.auth) {
      await replace({
        files: `${__frontenddir}/src/app/app.component.html`,
        from: ['<div auiHeaderMenuItem>'],
        to: [
          `<div auiHeaderMenuItem>
          <a routerLink="/login">
        <button class="a-button">
          <span>Aanmelden</span>
        </button>
      </a>`,
        ],
      });

      if (config.routing.add) {
        await copyFolderRecursiveSync(`${__basedir}/generators/angular/files/extra/src/app/pages/login/`, `${__frontenddir}/src/app/pages`);
        const loginRoutingReplacePages = {
          files: `${__frontenddir}/src/app/pages/index.ts`,
          from: ["import { AboutPage } from './about/about.page';", 'AboutPage,'],
          to: [
            `import { AboutPage } from './about/about.page';
import { LoginPage } from './login/login.page';`,
            `AboutPage,
LoginPage,`,
          ],
        };

        await replace(loginRoutingReplacePages);

        await replace({
          files: `${__frontenddir}/src/app/app-routing.module.ts`,
          from: ["import { AboutPage } from './pages/about/about.page';", "{ path: 'about', component: AboutPage },"],
          to: [
            `import { AboutPage } from './pages/about/about.page';
          import { LoginPage } from './pages/login/login.page';`,
            `{ path: 'about', component: AboutPage },
          { path: 'login', component: LoginPage }`,
          ],
        });
      } else {
        await replace({
          files: `${__frontenddir}/src/app/app.component.html`,
          from: ['routerLink="/login"', '<ul className="a-list">'],
          to: [
            'url="/auth/login/mprofiel"',
            `<ul className="a-list">
          <li><a href="/auth/login/mprofiel" className="has-icon-right">Login MProfiel</a></li>
          `,
          ],
        });
      }

      await copyFolderRecursiveSync(`${__basedir}/generators/angular/files/extra/src/app/services`, `${__frontenddir}/src/app`);

      await execPromise('npm', ['install', '--save', 'rxjs'], { cwd: path.resolve('frontend') });
      await replace({
        files: `${__frontenddir}/src/app/app.component.ts`,
        from: ['export class AppComponent { }', "import { Component } from '@angular/core';"],
        to: [
          `export class AppComponent implements OnInit {
          public userData: any;
        
          constructor(
            private userService: UserService) { }
        
          ngOnInit() {
            this.userService.getUser().then((resp) => {
              resp.json().then((data) => {
                this.userData = data.user;
              });
            });
          }
        }
        `,
          `import { Component, OnInit } from '@angular/core';
          import { UserService } from './services/user';
          `,
        ],
      });

      // TODO: ADD USER MENU!

      await replace({
        files: `${__frontenddir}/src/app/app.module.ts`,
        from: ["import { AppComponent } from './app.component';", '..AuiModules,'],
        to: [
          `import { ServiceModule } from './services';
        import { AppComponent } from './app.component';`,
          `..AuiModules,
        ServiceModule,`,
        ],
      });
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
