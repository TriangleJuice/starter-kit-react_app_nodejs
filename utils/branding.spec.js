import { getBrandings, mapBranding } from './branding';

describe('Branding Utilities Test', () => {
  it('should return available brandings', async () => {
    const brandings = await getBrandings();
    // Should have mapped the package json version unto the different brandings
    expect(Object.keys(brandings).length).toBe(3);

    Object.keys(brandings).map(key => brandings[key]).forEach((branding) => {
      expect(branding).not.toBeUndefined();
      expect(branding).not.toBeNull();

      expect(branding.version).not.toBeUndefined();
      expect(typeof branding.scss).not.toBeUndefined();
    });
  });

  it('should get the branding based on the key', async () => {
    const branding = await mapBranding('Digipolis');
    const brandings = await getBrandings();
    expect(branding).toEqual(brandings.Digipolis);
  });

  it('should default to antwerp if the key cannot be found', async () => {
    const branding = await mapBranding('whatever');
    const brandings = await getBrandings();
    expect(branding).toEqual(brandings.Antwerp);
  });
});
