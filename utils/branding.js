const package = require('./package');

const brandings = {
  ACPaaS: {
    cdn: 'acpaas_branding_scss',
    npm: ['@a-ui/core', '@a-ui/acpaas'],
    version: 0,
    type: 'acpaas',
    key: 'ACPaaS',
  },
  Digipolis: {
    cdn: 'digipolis_branding_scss',
    npm: ['@a-ui/core', '@a-ui/digipolis'],
    version: '3.0.2',
    type: 'digipolis',
    key: 'Digipolis',
  },
  Antwerp: {
    cdn: 'core_branding_scss',
    npm: ['@a-ui/core'],
    version: '3.0.3',
    type: 'core',
    key: 'default',
  },
};

const getBrandings = async () => {
  const keys = Object.keys(brandings);
  const updatedBrandings = {};
  await Promise.all(keys.map(async (key) => {
    const branding = brandings[key];
    branding.version = await package.getlatestverion(branding.npm);
    updatedBrandings[key] = branding;
    return branding;
  }));
  return updatedBrandings;
}

async function mapBranding(key) {
  if (key in brandings) return (await getBrandings())[key];
  return (await getBrandings()).Antwerp;
}

module.exports = {
  mapBranding,
  getBrandings,
  brandings,
};
