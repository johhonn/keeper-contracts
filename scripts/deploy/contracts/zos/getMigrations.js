const glob = require('glob')

function getMigrations() {
    const zosFile = glob.sync(`${__dirname}/../../../../zos.*.json`, 'utf-8')[0]
    /* eslint-disable-next-line security/detect-non-literal-require */
    return require(zosFile)
}

module.exports = getMigrations
