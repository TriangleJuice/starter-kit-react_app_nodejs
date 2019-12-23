import * as fs from 'fs';

const overwriteAndRename = async (oldPath, newPath, code) => {
  fs.renameSync(oldPath, newPath);
  console.log(newPath);
  fs.writeFileSync(newPath, code);
};

export default overwriteAndRename;
