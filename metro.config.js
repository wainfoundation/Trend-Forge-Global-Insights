const exclusionList = require('metro-config/src/defaults/exclusionList');

module.exports = {
  resolver: {
    blacklistRE: exclusionList([
      /AppData[\/\\]Local[\/\\]ElevatedDiagnostics[\/\\].*/,
    ]),
  },
};
