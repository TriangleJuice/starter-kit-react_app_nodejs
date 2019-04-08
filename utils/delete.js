const fs = require('fs');
const rimraf = require('rimraf');

function deleteFolderSync(folder) {
  if (fs.existsSync(folder)) {
    rimraf.sync(folder);
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

function deleteFileSync(filepath) {
  try {
    return fs.unlinkSync(filepath);
  } catch (e) {
    console.log('Delete file error:', e);
    throw e;
  }
}

module.exports = {
  deleteFolderSync,
  deleteFolderRecursive,
  deleteFileSync,
};
