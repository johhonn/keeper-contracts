/* eslint-disable no-console */
const writeArtifact = require('./writeArtifact')

const zosGetProxyAddress = require('../zos/contracts/addresses/getProxyAddress')
const zosGetMigrations = require('../zos/handlers/getMigrations')

async function exportContractArtifacts(
    projectName,
    networkName,
    networkId,
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

        const artifact = writeArtifact(
            contractName,
            proxyAddress,
            networkName,
            version
        )

        if (verbose) {
            console.log(`Exported contract artifact: ${artifact.version} of ${contractName} at ${artifact.address}`)
        }
    }
}

module.exports = exportContractArtifacts
