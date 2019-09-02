const path = require('path');
const replace = require('replace-in-file');

const { updateLog, errorLog } = require('../../utils/log');
const { deleteFolderSync } = require('../../utils/delete');
const { updatePackageJson, getlatestverion } = require('../../utils/package');
const { copyFolderRecursiveSync, copyFileSync } = require('../../utils/copy');
const brandings = require('../../config/brandings.config');
const { mapBranding } = require('../../utils/branding');
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

function getUserMenuLogic(hasRouting) {
  if (hasRouting) {
    return "this.router.navigate(['/login']);";
  }

  return "window.location.href = '/auth/login/mprofiel';";
}

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

  // TODO: update core branding logo version

  const coreVersion = await getlatestverion('@a-ui/core');

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

    if (config.routing.add) {
      await copyFolderRecursiveSync(`${__basedir}/generators/angular/files/extra/src/app/pages/`, `${__frontenddir}/src/app`);
      deleteFolderSync(`${__frontenddir}/src/app/pages/login`);
      copyFileSync(`${__basedir}/generators/angular/files/extra/src/app/app-routing.module.ts`, `${__frontenddir}/src/app`);
      copyFileSync(`${__basedir}/generators/angular/files/extra/src/app/app.component.html`, `${__frontenddir}/src/app`);
      const replaceAppComponentHtml = {
        files: `${__frontenddir}/src/app/app.component.html`,
        from: [/<\/aui-header>/, '<div class="o-header__wrapper">'],
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
          `<div class="o-header__wrapper">
      <aui-logo src="https://cdn.antwerpen.be/core_branding_scss/${coreVersion}/assets/images/a-logo.svg"></aui-logo>`,
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
      await copyFolderRecursiveSync(`${__basedir}/generators/angular/files/extra/src/app/components`, `${__frontenddir}/src/app`);
      await replace({
        files: `${__frontenddir}/src/app/app.component.html`,
        from: ['</aui-header>'],
        to: [
          `<div auiHeaderMenuItem>
          <user-flyout [user]="user" (login)="login()"></user-flyout>
        </div>
      </aui-header>`,
        ],
      });

      await replace({
        files: `${__frontenddir}/src/app/app.module.ts`,
        from: ['declarations: [AppComponent', 'import { AuiModules } from "./aui.modules";'],
        to: [
          `declarations: [AppComponent,
          ...Components`,
          `import { AuiModules } from "./aui.modules";
          import { Components } from "./components";`,
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
          ${config.routing.add ? 'private router: Router,' : ''}
            private userService: UserService) { }
        
          ngOnInit() {
            this.userService.getUser().then((resp) => {
              resp.json().then((data) => {
                this.userData = data.user;
              });
            });
          }

          login() {
            ${getUserMenuLogic(config.routing.add)}
          }
        }
        `,
          `import { Component, OnInit } from '@angular/core';
          ${config.routing.add ? "import { Router } from '@angular/router';" : ''}
          import { UserService } from './services/user';
          `,
        ],
      });

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

      await replace({
        files: `${__frontenddir}/src/app/aui.modules.ts`,
        from: ['LogoModule,', 'import { LogoModule } from "@acpaas-ui/ngx-components/logo";'],
        to: [
          `LogoModule,
        AvatarModule,
        FlyoutModule`,
          `import { LogoModule } from "@acpaas-ui/ngx-components/logo";
        import { AvatarModule } from "@acpaas-ui/ngx-components/avatar";
        import { FlyoutModule } from "@acpaas-ui/ngx-components/flyout";`,
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
