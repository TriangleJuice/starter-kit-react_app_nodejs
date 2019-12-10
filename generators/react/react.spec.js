import prepareConfiguration from './react';

describe('React generator test', () => {
  let mockConfig;
  let mockBranding;

  beforeEach(() => {
    mockBranding = {
      cdn: 'core_branding_scss',
      npm: ['@a-ui/core'],
      version: '4.0.0',
      type: 'core',
      key: 'Antwerp',
      scss: [],
    };
    mockConfig = {
      backend: undefined,
      frontend: 'react',
      branding: Promise.resolve(mockBranding),
    };
  });

  describe('Preparing configuration', () => {
    it('should copy the configuration object and resolve branding properties', async () => {
      const config = await prepareConfiguration(mockConfig);
      // By now branding should have been resolved
      expect(config.branding).notBe(mockBranding);
      expect(config.routing).not.toBeUndefined();
    });
  });
});
