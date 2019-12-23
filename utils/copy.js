import * as fx from 'mkdir-recursive';
import * as fs from 'fs';
import * as path from 'path';


export function copyFileSync(source, target) {
  let targetFile = target;

  // If target is a directory a new file with the same name will be created
  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isDirectory()) {
      targetFile = path.join(target, path.basename(source));
    }
  }

  fs.writeFileSync(targetFile, fs.readFileSync(source));
}

export function copyFolderRecursiveSync(source, target) {
  let files = [];

  // Check if folder needs to be created or integrated
  const targetFolder = path.join(target, path.basename(source));
  if (!fs.existsSync(targetFolder)) {
    fx.mkdirSync(targetFolder);
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

export function copyJob(jobs) {
  const promiseArray = jobs.map(({ source, destination, type }) => {
    if (type === 'folder') {
      return copyFolderRecursiveSync(source, destination);
    }
    return copyFileSync(source, destination);
  });
  return Promise.all(promiseArray);
}
