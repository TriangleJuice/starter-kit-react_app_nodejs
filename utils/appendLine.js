const fs = require('fs');

async function appendLine(file, text) {
  return new Promise((resolve) => {
    const stream = fs.createWriteStream(file, { flags: 'a' });
    stream.write(`${text}\n`);
    stream.on('finish', resolve);
  });
}

module.exports = {
  appendLine,
};
