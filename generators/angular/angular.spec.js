import '../../globals';
import spawn from '../../utils/mock-spawn';
import angular from './angular';
import * as sinon from 'sinon';
import * as mockFs from 'mock-fs';
import * as fs from 'fs';

describe('Angular Generator', () => {
  let generator, mockConfiguration;
  let mySpawn;

  beforeEach(() => {
    console.log('');  // Do not remove this line! We have to register the stdout before mocking the file system
    mockFs.default({});
    mockConfiguration = {
      name: 'Test App',
      branding: {
        cdn: 'some-cdn',
        version: '1.0.0',
        scss: ['@import "one"'],
        type: 'core'
      },
      routing: {
        add: false
      }
    };
    generator = new angular.AngularAppGenerator(mockConfiguration);
  })

  afterEach(() => {
    mockFs.restore();
  })

  describe('Construct', () => {
    it('should construct the generator', () => {
      expect(generator).toBeDefined();
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

  describe('Installing Angular', () => {
    it('should install angular using the cli tool', async () => {
      await generator.installAngular(mockConfiguration);
      console.log(child_process.spawn);
    });
  });
});
