/* eslint-disable no-console */
const fs = require('fs')

const createArtifact = require('./createArtifact')
const getZOSMigration = require('../getZOSMigration')

const artifactsDir = `${__dirname}/../../../../artifacts/`
const zosPath = `${__dirname}/../../../../zos.json`

function exportArtifacts(
    network,
    version
) {
    /* eslint-disable-next-line security/detect-non-literal-require */
    const { name } = require(zosPath)

    console.log(`Exporting: ${name}`)

    // load migrations from zos
    const { contracts, proxies } = getZOSMigration()
    const contractNames = Object.keys(contracts)

    contractNames.forEach((contractName) => {
        console.log(`Exporting artifact: ${contractName}.${network}.json`)

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

        console.log(`Exported artifact: ${artifact.version} of ${contractName} at ${artifact.address}`)
    })

    /* eslint-disable-next-line no-console */
    console.log(name, version, network)
}

module.exports = exportArtifacts
