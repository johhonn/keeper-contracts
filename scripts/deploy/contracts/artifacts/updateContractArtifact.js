/* eslint-disable no-console */
const fs = require('fs')
const path = require('path')

const createArtifact = require('./createArtifact')
const zosGetMigrations = require('../zos/handlers/getMigrations')

const artifactsDir = `${__dirname}/../../../../artifacts`
const network = process.env.NETWORK || 'development'

function updateContractArtifact(
    oldContractName,
    newContractName,
    version,
    networkId,
    verbose = true
) {
    const { contracts } = zosGetMigrations(networkId)

    if (!(oldContractName in contracts)) {
        throw new Error('Contract was not handled by zos.')
    }

    if (verbose) {
        console.log(`Updating contract artifact: ${oldContractName} with the ABI of ${newContractName}`)
    }

    const artifactFileName = `${oldContractName}.${network.toLowerCase()}.json`

    const resolvedArtifactsDir = path.resolve(artifactsDir)

    /* eslint-disable-next-line security/detect-non-literal-fs-filename */
    const oldArtifactString = fs.readFileSync(
        `${resolvedArtifactsDir}/${artifactFileName}`,
        'utf8'
    ).toString()

    const oldArtifact = JSON.parse(oldArtifactString)

    const { address } = oldArtifact

    // create a new artifact with the new content
    const artifact = createArtifact(
        newContractName,
        address,
        version
    )

    const artifactString = JSON.stringify(artifact, null, 2)

    /* eslint-disable-next-line security/detect-non-literal-fs-filename */
    fs.writeFileSync(
        `${artifactsDir}/${artifactFileName}`,
        artifactString
    )
}

module.exports = updateContractArtifact
