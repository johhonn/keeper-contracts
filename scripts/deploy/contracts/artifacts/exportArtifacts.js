/* eslint-disable no-console */
const fs = require('fs')

const createArtifact = require('./createArtifact')
const zosGetMigrations = require('../zos/getMigrations')

const artifactsDir = `${__dirname}/../../../../artifacts/`
const zosPath = `${__dirname}/../../../../zos.json`

async function exportArtifacts(
    network,
    version,
    stfu = false
) {
    /* eslint-disable-next-line security/detect-non-literal-require */
    const { name } = require(zosPath)

    if (!stfu) {
        console.log(`Exporting: ${name}`)
    }

    // load migrations from zos
    const { contracts, proxies } = zosGetMigrations()
    const contractNames = Object.keys(contracts)

    contractNames.forEach((contractName) => {
        if (!stfu) {
            console.log(`Exporting artifact: ${contractName}.${network}.json`)
        }

        // get proxy address from zos proxies
        const proxyAddress = proxies[`${name}/${contractName}`][0].address

        // create the artifact
        const artifact = createArtifact(
            contractName,
            proxyAddress,
            version
        )

        // set filename
        const filename = `${contractName}.${network.toLowerCase()}.json`

        // write artifact
        const artifactString = JSON.stringify(artifact, null, 2)

        /* eslint-disable-next-line security/detect-non-literal-fs-filename */
        fs.writeFileSync(`${artifactsDir}${filename}`, artifactString)

        if (!stfu) {
            console.log(`Exported artifact: ${artifact.version} of ${contractName} at ${artifact.address}`)
        }
    })

    if (!stfu) {
        console.log(name, version, network)
    }
}

module.exports = exportArtifacts
