const pkg = require('./package');

const brandings = {
  Antwerp: {
    cdn: 'core_branding_scss',
    npm: ['@a-ui/core'],
    version: '0',
    type: 'core',
    key: 'Antwerp',
    scss: [],
  },
  Digipolis: {
    cdn: 'digipolis_branding_scss',
    npm: ['@a-ui/core', '@a-ui/digipolis'],
    version: '0',
    type: 'digipolis',
    key: 'Digipolis',
    scss: ['@import "~@a-ui/digipolis/src/styles/quarks/quarks.variables";'],
  },
  ACPaaS: {
    cdn: 'acpaas_branding_scss',
    npm: ['@a-ui/core', '@a-ui/acpaas'],
    version: '0',
    type: 'acpaas',
    key: 'ACPaaS',
    scss: ['@import "~@a-ui/acpaas/src/styles/quarks/quarks.variables";'],
  },
};

const getBrandings = async () => {
  const keys = Object.keys(brandings);
  const updatedBrandings = {};
  await Promise.all(keys.map(async (key) => {
    const branding = brandings[key];
    branding.version = await pkg.getlatestverion(branding.npm);
    updatedBrandings[key] = branding;
    return branding;
  }));
  return updatedBrandings;
};

async function mapBranding(key) {
  if (key in brandings) return (await getBrandings())[key];
  return (await getBrandings()).Antwerp;
}

module.exports = {
  mapBranding,
  getBrandings,
  brandings,
};
