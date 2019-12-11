import '../../globals';
import angular from './angular';
import * as sinon from 'sinon';
import * as mockFs from 'mock-fs';
import * as fs from 'fs';
import * as path from 'path';
import HandlebarsTemplateGenerator from '../../utils/template-generator';
import { setUpMockDir } from './helpers/mock-directory';
import rcrd from 'recursive-readdir';

describe('Angular Generator', () => {
  let generator, mockConfiguration, mockExecPromise, templateGenerator, spyOnGenerate;

  beforeEach(() => {
    console.log('');  // Do not remove this line! We have to register the stdout before mocking the file system
    mockExecPromise = sinon.stub();
    mockFs.default({});
    mockConfiguration = {
      name: 'Test App',
      branding: {
        cdn: 'some-cdn',
        version: '1.0.0',
        scss: ['@import "one"'],
        type: 'core',
        npm: 'branding.npm'
      },
      routing: {
        add: false,
        npm: 'routing.npm'
      }
    };
    templateGenerator = sinon.createStubInstance(HandlebarsTemplateGenerator);
    spyOnGenerate = templateGenerator.generate;
    generator = new angular.AngularAppGenerator(mockConfiguration, mockExecPromise, templateGenerator);
  })

  afterEach(() => {
    mockFs.restore();
  })

  describe('Construct', () => {
    it('should construct the generator', () => {
      expect(generator).toBeDefined();
      expect(generator.generator).toBe(templateGenerator);
    })
  });

  describe('Start Process', () => {
    it('should be calling all hooks for setting up an angular application', async () => {
      const spyOnPrepare = sinon.stub(generator, 'prepareDirectory').returns(Promise.resolve());
      const spyOnInstallAngular = sinon.stub(generator, 'installAngular').returns(Promise.resolve());
      const spyOnInstallAcpaasUI = sinon.stub(generator, 'installACPaasUI').returns(Promise.resolve());
      const spyOnStarterTemplate = sinon.stub(generator, 'createStarterTemplate').returns(Promise.resolve());

      await generator.start();
      expect(spyOnInstallAngular.calledOnce).toBe(true);
      expect(spyOnInstallAcpaasUI.calledOnce).toBe(true);
      expect(spyOnStarterTemplate.calledOnce).toBe(true);
    });
    it('should create a frontend directory', async () => {
      expect(fs.existsSync(__frontenddir)).toBe(false);
      await generator.prepareDirectory();
      expect(fs.existsSync(__frontenddir)).toBe(true);
    });
  });

  describe('Install Angular', () => {
    it('should install angular using command line', async () => {
      await generator.installAngular(mockConfiguration);
      expect(mockExecPromise.calledOnce).toBe(true);
      //Check first command line argument
      expect(mockExecPromise.firstCall.args).toEqual(["npx", ["-p", "@angular/cli", "ng", "new", "frontend", "--skipGit=false", "--style=scss", "--routing=false"]]);
    });
  });

  describe('Installing ACPaas UI', () => {
    it('should install ACPaas ui', async () => {
      await generator.installACPaasUI(mockConfiguration);
      expect(mockExecPromise.calledTwice).toBe(true);
      expect(mockExecPromise.firstCall.args).toEqual(["npm", ["install", "--save-dev", "node-sass"], { "cwd": path.resolve(__frontenddir) }]);
      expect(mockExecPromise.secondCall.args).toEqual(["npm", ["install", "--save", "@acpaas-ui/ngx-components", "branding.npm", "routing.npm"], { "cwd": path.resolve(__frontenddir) }]);
    });
  });
  describe('Creating templates', () => {
    it('should generate appropriate template files (with auth & routing)', async () => {
      setUpMockDir();
      await generator.createStarterTemplate({
        ...mockConfiguration,
        auth: true,
        routing: {
          ...mockConfiguration.routing,
          add: true
        }
      });
      //index.html
      expect(spyOnGenerate.getCalls()[0].args).toContainEqual({
        fromTemplate: path.resolve(__frontenddir, 'src/index.html.template.hbs'),
        to: path.resolve(__frontenddir, 'src/index.html')
      });

      //styles.scss
      expect(spyOnGenerate.getCalls()[1].args).toContainEqual({
        fromTemplate: path.resolve(__frontenddir, 'src/styles.scss.template.hbs'),
        to: path.resolve(__frontenddir, 'src/styles.scss')
      });

      // app.module.ts
      expect(spyOnGenerate.getCalls()[2].args).toContainEqual({
        fromTemplate: path.resolve(__frontenddir, 'src/app/app.module.ts.template.hbs'),
        to: path.resolve(__frontenddir, 'src/app/app.module.ts')
      });

      //app.component.html
      expect(spyOnGenerate.getCalls()[3].args).toContainEqual({
        fromTemplate: path.resolve(__frontenddir, 'src/app/app.component.html.template.hbs'),
        to: path.resolve(__frontenddir, 'src/app/app.component.html')
      });

      //app.component.ts
      expect(spyOnGenerate.getCalls()[4].args).toContainEqual({
        fromTemplate: path.resolve(__frontenddir, 'src/app/app.component.ts.template.hbs'),
        to: path.resolve(__frontenddir, 'src/app/app.component.ts')
      });

      expect(spyOnGenerate.getCalls()[5].args).toContainEqual({
        fromTemplate: path.resolve(__frontenddir, 'src/app/pages/index.ts.template.hbs'),
        to: path.resolve(__frontenddir, 'src/app/pages/index.ts'),
      });
    });
  });
});
