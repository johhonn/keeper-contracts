const fs = require('fs')
const path = require('path')
const glob = require('glob')

function translateNetworkId(
    networkId
) {
    return networkId === 42 ? 'kovan' : networkId
}

function getMigrations(
    networkId
) {
    const zosSearchPath = `${__dirname}/../../../../../zos.*${translateNetworkId(networkId)}.json`
    const resolvedPath = path.resolve(zosSearchPath)

    const files = glob.sync(
        resolvedPath
    )

    if (files.length < 1) {
        throw new Error(
            `Cannot find any file for '${resolvedPath}'`
        )
    }

    const zosFile = files[0]

    /* eslint-disable-next-line security/detect-non-literal-fs-filename */
    const zosFileString = fs.readFileSync(zosFile, 'utf8').toString()

    return JSON.parse(zosFileString)
}

module.exports = getMigrations
