/* eslint-disable no-console */
const writeArtifact = require('./writeArtifact')

const zosGetMigrations = require('../zos/getMigrations')

const zosPath = `${__dirname}/../../../../zos.json`

async function exportArtifacts(
    network,
    version,
    verbose = true
) {
    /* eslint-disable-next-line security/detect-non-literal-require */
    const { name } = require(zosPath)

    if (verbose) {
        console.log(`Exporting: ${name}`)
    }

    // load migrations from zos
    const { contracts, proxies, solidityLibs } = zosGetMigrations()
    const contractNames = Object.keys(contracts)

    contractNames.forEach((contractName) => {
        if (verbose) {
            console.log(`Exporting artifact: ${contractName}.${network}.json`)
        }

        // get proxy address from zos proxies
        const proxyAddress = proxies[`${name}/${contractName}`][0].address

        const artifact = writeArtifact(
            network,
            contractName,
            proxyAddress,
            version
        )

        if (verbose) {
            console.log(`Exported contract artifact: ${artifact.version} of ${contractName} at ${artifact.address}`)
        }
    })

    const solidityLibNames = Object.keys(solidityLibs)

    solidityLibNames.forEach((solidityLibName) => {
        if (verbose) {
            console.log(`Exporting library: ${solidityLibName}.${network}.json`)
        }

        const artifact = writeArtifact(
            network,
            solidityLibName,
            solidityLibs[solidityLibName].address,
            version
        )

        if (verbose) {
            console.log(`Exported library artifact: ${artifact.version} of ${solidityLibName} at ${artifact.address}`)
        }
    })

    if (verbose) {
        console.log(name, version, network)
    }
}

module.exports = exportArtifacts
