import brandings from '../config/brandings.config';

const pkg = require('./package');

export const getBrandings = async () => {
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

export async function mapBranding(key) {
  if (key in brandings) return (await getBrandings())[key];
  return (await getBrandings()).Antwerp;
}
