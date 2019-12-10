export default {
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
