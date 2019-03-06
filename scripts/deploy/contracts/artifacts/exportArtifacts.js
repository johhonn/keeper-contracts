/* eslint-disable no-console */
const fs = require('fs')

const writeArtifact = require('./writeArtifact')
const zosGetMigrations = require('../zos/getMigrations')

const zosPath = `${__dirname}/../../../../zos.json`

async function exportArtifacts(
    networkName,
    networkId,
    version,
    verbose = true
) {
    /* eslint-disable-next-line security/detect-non-literal-fs-filename */
    const { name } = JSON.parse(fs.readFileSync(zosPath, 'utf8'))

    if (verbose) {
        console.log(`Exporting: ${name}`)
    }

    // load migrations from zos
    const { contracts, proxies, solidityLibs } = zosGetMigrations(networkId)
    const contractNames = Object.keys(contracts)

    contractNames.forEach((contractName) => {
        if (verbose) {
            console.log(`Exporting artifact: ${contractName}.${networkName}.json`)
        }

        // get proxy address from zos proxies
        const proxyAddress = proxies[`${name}/${contractName}`][0].address

        const artifact = writeArtifact(
            contractName,
            proxyAddress,
            networkName,
            version
        )

        if (verbose) {
            console.log(`Exported contract artifact: ${artifact.version} of ${contractName} at ${artifact.address}`)
        }
    })

    const solidityLibNames = Object.keys(solidityLibs)

    solidityLibNames.forEach((solidityLibName) => {
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
    })

    if (verbose) {
        console.log(name, version, networkName)
    }
}

module.exports = exportArtifacts
