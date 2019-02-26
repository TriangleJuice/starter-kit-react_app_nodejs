const { mapBranding } = require('../utils/branding');

module.exports = {
  flexbox: {
    link: '<link rel="stylesheet" href="https://cdn.antwerpen.be/core_flexboxgrid_scss/1.0.1/flexboxgrid.min.css">',
  },
  branding: {
    generateLinkTag: async (name) => {
      const { cdn, version } = await mapBranding(name);
      return `<link rel="stylesheet" href="https://cdn.antwerpen.be/${cdn}/${version}/main.min.css">`;
    },
  },
};
