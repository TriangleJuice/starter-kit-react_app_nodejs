const axios = require('axios');
const fs = require('fs');
const merge = require('deepmerge');

const getlatestverion = async (packageName) => {
  let key = packageName;
  if (Array.isArray(packageName)) {
    key = packageName[packageName.length - 1];
  }
  const response = await axios.get(`https://registry.npmjs.com/${key}`);
  return response.data['dist-tags'].latest;
};

const updatePackageJson = (newValues, pkgLocation) => {
  const pkgJson = JSON.parse(fs.readFileSync(pkgLocation));
  const newPkgJson = merge(pkgJson, newValues);
  fs.writeFileSync(pkgLocation, JSON.stringify(newPkgJson, null, 2));
};

module.exports = {
  getlatestverion,
  updatePackageJson,
};
