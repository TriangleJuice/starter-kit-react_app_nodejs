const gitClone = require('git-clone');
const util = require('util');

const gitClonePromisify = util.promisify(gitClone);

function gitclone(repo, tag) {
  return gitClonePromisify(repo, './tmp', { checkout: `tags/${tag}` });
}


module.exports = gitclone;
