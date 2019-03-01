const fs = require('fs')
const glob = require('glob')

function getMigrations() {
    const zosFile = glob.sync(`${__dirname}/../../../../zos.*.json`, 'utf-8')[0]
    /* eslint-disable-next-line security/detect-non-literal-fs-filename */
    return JSON.parse(fs.readFileSync(zosFile, 'utf8'))
}

module.exports = getMigrations
