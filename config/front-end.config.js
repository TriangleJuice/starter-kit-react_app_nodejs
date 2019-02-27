const { mapBranding } = require('../utils/branding');

module.exports = {
  flexbox: {
    link: '<link rel="stylesheet" href="https://cdn.antwerpen.be/core_flexboxgrid_scss/1.0.1/flexboxgrid.min.css">',
  },
  branding: {
    generateLinkTag: async (branding) => {
      return `<link rel="stylesheet" href="https://cdn.antwerpen.be/${branding.cdn}/${branding.version}/main.min.css">`;
    },
  },
};
