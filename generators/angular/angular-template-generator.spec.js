import '../../globals';
import * as path from 'path';
import HandlebarsTemplateGenerator from '../../utils/template-generator';
import * as frontEndConfig from '../../config/front-end.config';

describe('Angular Template Generator', () => {
  let mockConfiguration;
  let generator;

  beforeEach(() => {
    global.__basedir = '.';
    mockConfiguration = {
      name: 'Test App',
      branding: {
        cdn: 'some-cdn',
        version: '1.0.0',
        scss: ['@import "one"'],
        type: 'core',
      },
    };
    generator = new HandlebarsTemplateGenerator(mockConfiguration);
  });

  describe('Prepping config for templating', () => {
    it('should prep config', () => {
      const config = HandlebarsTemplateGenerator.prepConfigForRendering(mockConfiguration);
      expect(config.scss).toBe('@import "one"');
      expect(config.coreBranding).toBe(true);
      expect(config.frontEndConfig.flexbox.link).toBe('<link rel="stylesheet" href="https://cdn.antwerpen.be/core_flexboxgrid_scss/1.0.1/flexboxgrid.min.css">');
    });
  });

  describe('App Module', () => {
    const templatePath = path.resolve(__dirname, 'files/src/app/app.module.ts.template.hbs');
    it('should generate a basic app module', async () => {
      const appModule = await generator.compileAndRenderTemplate(templatePath, mockConfiguration);
      expect(typeof appModule).toBe('string');
    });
    it('should add routing configuration when needed', async () => {
      const appModule = await generator.compileAndRenderTemplate(templatePath, {
        ...mockConfiguration,
        routing: {
          add: true,
        },
      });
      expect(appModule).toContain('AppRoutingModule');
      expect(appModule).toContain('...Pages');
    });
    it('should import login and necessary modules when auth is enabled', async () => {
      const code = await generator.compileAndRenderTemplate(templatePath, {
        ...mockConfiguration,
        auth: true,
      });
      expect(code).toContain('import { UserMenuModule } from \'@acpaas-ui/ngx-components/user-menu\'');
      expect(code).toContain('import { ServiceModule } from \'./services\'');
      expect(code).toContain('AvatarModule');
    });
  });

  describe('Index HTML file', () => {
    const templatePath = path.resolve(__dirname, 'files/src/index.html.template.hbs');
    it('should set the title tag', async () => {
      const index = await generator.compileAndRenderTemplate(templatePath, mockConfiguration);
      expect(index).toContain('<title>Test App</title>');
    });
    it('should inject the branding css style link', async () => {
      const index = await generator.compileAndRenderTemplate(templatePath, mockConfiguration);
      expect(index).toContain('<link rel="stylesheet" href="https://cdn.antwerpen.be/some-cdn/1.0.0/main.min.css"/>');
    });
    it('should set core branding colors', async () => {
      const index = await generator.compileAndRenderTemplate(templatePath, {
        ...mockConfiguration,
        branding: {
          type: 'core',
        },
      });
      expect(index).toContain('safari-pinned-tab.svg" color="#347ea6"');
      expect(index).toContain('msapplication-TileColor" content="#5fb1d6"');
      expect(index).toContain('theme-color" content="#ffffff"');
    });

    it('should use other colors if not core branding', async () => {
      const index = await generator.compileAndRenderTemplate(templatePath, {
        ...mockConfiguration,
        branding: {
          type: 'whatever',
        },
      });
      expect(index).toContain('safari-pinned-tab.svg" color="#cf0039"');
      expect(index).toContain('msapplication-TileColor" content="#cf0039"');
      expect(index).toContain('theme-color" content="#cf0039"');
    });

    it('should include flexbox css link', async () => {
      const index = await generator.compileAndRenderTemplate(templatePath, {
        ...mockConfiguration,
        flexboxgrid: true,
      });
      expect(index).toContain(frontEndConfig.flexbox.link);
    });
  });

  describe('SASS file', () => {
    const templatePath = path.resolve(__dirname, 'files/src/styles.scss.template.hbs');
    it('should generate a sass file', async () => {
      const code = await generator.compileAndRenderTemplate(templatePath, mockConfiguration);
      expect(code).not.toBeUndefined();
    });
    it('should not include extra properties when handling core branding', async () => {
      const code = await generator.compileAndRenderTemplate(templatePath, {
        ...mockConfiguration,
        branding: {
          type: 'core',
        },
      });
      expect(code).not.toContain('o-header__title');
      expect(code).not.toContain('o-header__logo');
    });
    it('should inlude extra sass imports if configured so', async () => {
      const code = await generator.compileAndRenderTemplate(templatePath, {
        ...mockConfiguration,
        branding: {
          ...mockConfiguration.branding,
          scss: [
            '@import "one";',
            '@import "two";',
          ],
        },
      });
      expect(code).toContain('@import "one";');
      expect(code).toContain('@import "two"');
    });
  });

  describe('App Component Template', () => {
    const templatePath = path.resolve(__dirname, 'files/src/app/app.component.html.template.hbs');
    it('should generate an app component template', async () => {
      const code = await generator.compileAndRenderTemplate(templatePath, mockConfiguration);
      expect(code).not.toBeUndefined();
    });
    it('should include routing header if routing is enabled', async () => {
      const code = await generator.compileAndRenderTemplate(templatePath, {
        ...mockConfiguration,
        routing: {
          add: true,
        },
      });
      expect(code).toContain('o-header__content-wrapper');
      expect(code).toContain('routerLink="/home"');
      expect(code).toContain('routerLink="/about"');
    });
    it('should generate user menu when auth is enabled', async () => {
      const code = await generator.compileAndRenderTemplate(templatePath, {
        ...mockConfiguration,
        auth: true,
      });
      expect(code).toContain('aui-user-menu');
    });
    it('should include the logo if the core branding is used', async () => {
      const code = await generator.compileAndRenderTemplate(templatePath, {
        ...mockConfiguration,
        branding: {
          type: 'core',
        },
        coreVersion: '1.0.0',
      });
      expect(code).toContain('https://cdn.antwerpen.be/core_branding_scss/1.0.0/assets/images/a-logo.svg');
    });
  });
  describe('App Pages Index', () => {
    const templatePath = path.resolve(__dirname, 'files/extra/src/app/pages/index.ts.template.hbs');
    it('should generate pages', async () => {
      const code = await generator.compileAndRenderTemplate(templatePath, mockConfiguration);
      expect(code).not.toBeUndefined();
      expect(code).toContain('HomePage');
      expect(code).toContain('AboutPage');
      expect(code).not.toContain('LoginPage');
    });
    it('should include login page if auth is enabled', async () => {
      const code = await generator.compileAndRenderTemplate(templatePath, {
        ...mockConfiguration,
        auth: true,
      });
      expect(code).toContain('import { LoginPage } from \'./login/login.page\';');
    });
  });

  describe('Routing Module', () => {
    const templatePath = path.resolve(__dirname, 'files/extra/src/app/app-routing.module.ts.template.hbs');
    it('should include basic routes', async () => {
      const code = await generator.compileAndRenderTemplate(templatePath, mockConfiguration);
      expect(code).toContain('HomePage');
      expect(code).toContain('AboutPage');
      expect(code).not.toContain('LoginPage');
    });
    it('should inlude login routes if auth is enabled', async () => {
      const code = await generator.compileAndRenderTemplate(templatePath, {
        ...mockConfiguration,
        auth: true,
      });
      expect(code).toContain('import { LoginPage } from \'./pages/login/login.page\';');
      expect(code).toContain('LoginPage');
    });
  });

  describe('App Component Ts', () => {
    const templatePath = path.resolve(__dirname, 'files/src/app/app.component.ts.template.hbs');
    it('should generate basic app component', async () => {
      const code = await generator.compileAndRenderTemplate(templatePath, mockConfiguration);
      expect(code).not.toBeUndefined();
      expect(code).toContain('AppComponent');
    });
    it('shoudl generate login functionality if auth is enabled', async () => {
      const code = await generator.compileAndRenderTemplate(templatePath, {
        ...mockConfiguration,
        auth: true,
        routing: {
          add: true,
        },
      });
      expect(code).toContain('public userData: any;');
    });
  });
});
