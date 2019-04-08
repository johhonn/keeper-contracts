/* eslint-disable no-console */
const loadArtifact = require('./loadArtifact')
const createArtifact = require('./createArtifact')
const writeArtifact = require('./writeArtifact')

const zosGetImplementationAddress = require('../zos/contracts/addresses/getImplementationAddress')
const zosGetMigrations = require('../zos/handlers/getMigrations')

function updateContractArtifact(
    oldContractName,
    newContractName,
    version,
    networkId,
    networkName,
    verbose = true
) {
    const { contracts } = zosGetMigrations(networkId)

    if (!(oldContractName in contracts)) {
        throw new Error('Contract was not handled by zos.')
    }

    if (verbose) {
        console.log(`Updating contract artifact: ${oldContractName} with the ABI of ${newContractName}`)
    }

    const { address } = loadArtifact(
        oldContractName,
        networkName
    )

    const implementationAddress = zosGetImplementationAddress(
        oldContractName,
        networkId
    )

    // create a new artifact with the new content
    const artifact = createArtifact(
        newContractName,
        address,
        implementationAddress,
        version
    )

    writeArtifact(
        artifact,
        networkName
    )
}

module.exports = updateContractArtifact
