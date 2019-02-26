const gitClone = require('git-clone');

// Wrap callback into Promise
function gitclone(repo, branch) {
  return new Promise((resolve, reject) => {
    gitClone(repo, './tmp', {
      branch
    }, (err) => {
      if(err) {
        return reject(err);
      }
      return resolve();
    });
  });
}


module.exports = gitclone;
