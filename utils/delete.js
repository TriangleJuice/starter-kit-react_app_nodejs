const fs = require('fs');
const rimraf = require('rimraf');

function deleteFolderSync(folder) {
	if (fs.existsSync(folder)) {
		rimraf.sync(folder);
	}
}

module.exports.deleteFolderSync = deleteFolderSync;
