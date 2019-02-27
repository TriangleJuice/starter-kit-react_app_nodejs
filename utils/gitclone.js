const gitClone = require('git-clone');
const util = require('util');
const gitClonePromisify = util.promisify(gitClone);

function gitclone(repo, branch) {
  return gitClonePromisify(repo, './tmp', { branch })
}


module.exports = gitclone;
