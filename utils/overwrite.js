import * as fs from 'fs';

const overwriteAndRename = async (oldPath, newPath, contentsCallback) => {
  fs.renameSync(oldPath, newPath);
  const code = await contentsCallback();
  fs.writeFileSync(newPath, code);
};

export default overwriteAndRename;
