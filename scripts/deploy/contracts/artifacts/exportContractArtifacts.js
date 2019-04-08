/* eslint-disable no-console */
const createArtifact = require('./createArtifact')
const writeArtifact = require('./writeArtifact')

const zosGetProxyAddress = require('../zos/contracts/addresses/getProxyAddress')
const zosGetImplementationAddress = require('../zos/contracts/addresses/getImplementationAddress')
const zosGetMigrations = require('../zos/handlers/getMigrations')

async function exportContractArtifacts(
    projectName,
    networkId,
    networkName,
    version,
    verbose = true
) {
    // load migrations from zos
    const { contracts } = zosGetMigrations(networkId)

    const contractNames = Object.keys(contracts)

    for (const contractName of contractNames) {
        if (verbose) {
            console.log(`Exporting artifact: ${contractName}.${networkName}.json`)
        }

        // get proxy address from zos proxies
        const proxyAddress = await zosGetProxyAddress(
            projectName,
            contractName,
            networkId
        )

        const implementationAddress = await zosGetImplementationAddress(
            contractName,
            networkId
        )

        // create the artifact
        const artifact = createArtifact(
            contractName,
            proxyAddress,
            implementationAddress,
            version
        )

        writeArtifact(
            artifact,
            networkName
        )

        if (verbose) {
            console.log(`Exported contract artifact: ${artifact.version} of ${contractName} at ${artifact.address}`)
        }
    }
}

module.exports = exportContractArtifacts
