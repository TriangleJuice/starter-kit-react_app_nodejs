const fs = require('fs');
const path = require('path');

function copyFileSync(source, target) {
  let targetFile = target;

  // If target is a directory a new file with the same name will be created
  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isDirectory()) {
      targetFile = path.join(target, path.basename(source));
    }
  }

  fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function copyFolderRecursiveSync(source, target) {
  let files = [];

  // Check if folder needs to be created or integrated
  const targetFolder = path.join(target, path.basename(source));
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder);
  }

  // Copy
  if (fs.lstatSync(source).isDirectory()) {
    files = fs.readdirSync(source);
    files.forEach((file) => {
      const curSource = path.join(source, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, targetFolder);
      } else {
        copyFileSync(curSource, targetFolder);
      }
    });
  }
}
function deleteFolderRecursive(folderpath) {
  if (fs.existsSync(folderpath)) {
    fs.readdirSync(folderpath).forEach((file) => {
      const curPath = `${folderpath}/${file}`;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(folderpath);
  }
}

function copyJob(jobs) {
  const promiseArray = jobs.map(({ source, destination, type }) => {
    if (type === 'folder') {
      return copyFolderRecursiveSync(source, destination);
    }
    return copyFileSync(source, destination);
  });
  return Promise.all(promiseArray);
}

module.exports = {
  copyFolderRecursiveSync,
  copyJob,
  deleteFolderRecursive,
};
