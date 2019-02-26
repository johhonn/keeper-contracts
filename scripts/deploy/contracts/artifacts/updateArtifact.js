/* eslint-disable no-console */
const fs = require('fs')

const createArtifact = require('./createArtifact')
const zosGetMigrations = require('../zos/getMigrations')

const artifactsDir = `${__dirname}/../../../../artifacts/`
const network = process.env.NETWORK || 'development'

async function updateArtifact(
    oldContractName,
    newContractName,
    version,
    stfu = false
) {
    const { contracts } = zosGetMigrations()

    if (!(oldContractName in contracts)) {
        throw new Error('Contract was not handled by zos.')
    }

    if (!stfu) {
        console.log(`Updating artifact: ${oldContractName} with the ABI of ${newContractName}`)
    }

    const artifactFileName = `${oldContractName}.${network.toLowerCase()}.json`

    /* eslint-disable-next-line security/detect-non-literal-require */
    const oldArtifact = require(`${artifactsDir}${artifactFileName}`)
    const { address } = oldArtifact

    // create a new artifact with the new content
    const artifact = createArtifact(
        newContractName,
        address,
        version
    )

    const artifactString = JSON.stringify(artifact, null, 2)

    /* eslint-disable-next-line security/detect-non-literal-fs-filename */
    fs.writeFileSync(`${artifactsDir}${artifactFileName}`, artifactString)
}

module.exports = updateArtifact
