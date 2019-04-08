const fs = require('fs')
const path = require('path')

const artifactsDir = `${__dirname}/../../../../artifacts`

function loadArtifact(
    contractName,
    networkName
) {
    const artifactFileName = `${contractName}.${networkName.toLowerCase()}.json`

    const resolvedArtifactsDir = path.resolve(artifactsDir)

    /* eslint-disable-next-line security/detect-non-literal-fs-filename */
    const atritfactString = fs.readFileSync(
        `${resolvedArtifactsDir}/${artifactFileName}`,
        'utf8'
    ).toString()

    const artifact = JSON.parse(atritfactString)

    return artifact
}

module.exports = loadArtifact
