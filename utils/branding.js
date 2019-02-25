const brandings = {
  ACPaaS: {
    cdn: 'acpaas_branding_scss',
    npm: ['@a-ui/core', '@a-ui/acpaas'],
    version: '3.0.3',
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

function mapBranding(key) {
  if (key in brandings) return brandings[key];
  return brandings.Antwerp;
}

module.exports = {
  mapBranding,
  brandings,
};
