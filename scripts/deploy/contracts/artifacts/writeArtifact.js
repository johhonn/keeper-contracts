const fs = require('fs')
const path = require('path')

const artifactsDir = `${__dirname}/../../../../artifacts`

function writeArtifact(
    artifact,
    // name of the network
    networkName
) {
    // set filename
    const filename = `${artifact.name}.${networkName.toLowerCase()}.json`

    // write artifact
    const artifactString = JSON.stringify(artifact, null, 2)

    const resolvedArtifactsDir = path.resolve(artifactsDir)

    /* eslint-disable-next-line security/detect-non-literal-fs-filename */
    fs.writeFileSync(
        `${resolvedArtifactsDir}/${filename}`,
        artifactString
    )
}

module.exports = writeArtifact
