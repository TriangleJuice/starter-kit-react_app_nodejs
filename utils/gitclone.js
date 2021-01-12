const gitClone = require('git-clone');
const util = require('util');
const debug = require('./debug');

const gitClonePromisify = util.promisify(gitClone);

function gitclone(repo, tag, branch = null) {
  if (branch) {
    debug.logger(`Clone branch: ${branch}`);
    return gitClonePromisify(repo, './tmp', { checkout: branch });
  }
  debug.logger(`Clone tag: ${tag}`);
  return gitClonePromisify(repo, './tmp', { checkout: `tags/${tag}` });
}


module.exports = gitclone;
