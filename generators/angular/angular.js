const { updateLog, errorLog } = require('../../utils/log');
const { deleteFolderSync, deleteFileSync } = require('../../utils/delete');

async function installAngular() {}

async function installACPaasUI() {}

async function createStarterTemplate() {}

async function start(config) {
  const configuration = Object.assign({}, config);
  updateLog('Preparing...');
  try {
    deleteFolderSync('frontend');
    await installAngular(configuration);
    await installACPaasUI(configuration);
    await createStarterTemplate(configuration);
    updateLog('Done with front-end setup', 'cyan');
  } catch (e) {
    errorLog(e);
  }
}

module.exports = {
  getOptions,
  getQuestions,
  start,
};
