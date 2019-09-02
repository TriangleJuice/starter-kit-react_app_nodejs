const pkg = require('./package');
const brandings = require('../config/brandings.config');

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
