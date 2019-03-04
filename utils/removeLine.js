const fs = require('fs');

function removeMatchedLines(file, match) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, { encoding: 'utf-8' }, (err, data) => {
      if (err) throw err;
      const dataArray = data.split('\n'); // convert file data in an array
      let lastIndex = -1; // let say, we have not found the keyword

      for (let index = 0; index < dataArray.length; index += 1) {
        if (dataArray[index].includes(match)) { // check if a line contains the 'user1' keyword
          lastIndex = index; // found a line includes a 'user1' keyword
          dataArray.splice(lastIndex, 1); // remove the keyword 'user1' from the data Array
        }
      }

      const updatedData = dataArray.join('\n');
      fs.writeFile(file, updatedData, (error) => {
        if (err) reject(error);
        console.log('Successfully updated the file data');
        return resolve();
      });
    });
  });
}

module.exports = removeMatchedLines;
