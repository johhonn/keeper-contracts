const fs = require('fs')
const path = require('path')
const glob = require('glob')

function getMigrations(
    networkId
) {
    const searchPath = `${__dirname}/../../../../zos.*${networkId}.json`
    const resolvedPath = path.resolve(searchPath)

    const files = glob.sync(
        resolvedPath,
        'utf8'
    )

    if (files.length < 1) {
        throw new Error(`Cannot find any file for '${resolvedPath}'`)
    }

    const zosFile = files[0]

    /* eslint-disable-next-line security/detect-non-literal-fs-filename */
    const zosFileString = fs.readFileSync(zosFile, 'utf8').toString()

    return JSON.parse(zosFileString)
}

module.exports = getMigrations
