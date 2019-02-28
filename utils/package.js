const axios = require('axios');

getlatestverion = async (packageName) => {
  let key = packageName;
  if(Array.isArray(packageName)){
    key = packageName[packageName.length - 1];
  }
  const response = await axios.get(`https://registry.npmjs.com/${key}`);
  return response.data['dist-tags'].latest;
}

module.exports = {
  getlatestverion,
}
