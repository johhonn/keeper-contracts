/* eslint-disable no-console */
const writeArtifact = require('./writeArtifact')

const zosGetProxyAddress = require('../zos/contracts/addresses/getProxyAddress')
const zosGetMigrations = require('../zos/handlers/getMigrations')

async function exportArtifacts(
    projectName,
    networkName,
    networkId,
    version,
    verbose = true
) {
    if (verbose) {
        console.log(`Exporting: ${projectName}`)
    }

    // load migrations from zos
    const { contracts, solidityLibs } = zosGetMigrations(networkId)
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

    const solidityLibNames = Object.keys(solidityLibs)

    for (const solidityLibName of solidityLibNames) {
        if (verbose) {
            console.log(`Exporting library: ${solidityLibName}.${networkName}.json`)
        }

        const artifact = writeArtifact(
            solidityLibName,
            solidityLibs[solidityLibName].address,
            networkName,
            version
        )

        if (verbose) {
            console.log(`Exported library artifact: ${artifact.version} of ${solidityLibName} at ${artifact.address}`)
        }
    }

    if (verbose) {
        console.log(projectName, version, networkName)
    }
}

module.exports = exportArtifacts
