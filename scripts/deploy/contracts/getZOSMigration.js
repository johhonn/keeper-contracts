const fs = require('fs')
const glob = require('glob')

function getZOSMigration() {
    const zosFile = glob.sync('./zos.*.json', 'utf-8')[0]
    /* eslint-disable-next-line security/detect-non-literal-fs-filename */
    return JSON.parse(fs.readFileSync(zosFile, 'utf-8').toString())
}

module.exports = getZOSMigration
