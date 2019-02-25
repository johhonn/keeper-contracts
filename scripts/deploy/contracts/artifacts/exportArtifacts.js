/* eslint-disable no-console */
const fs = require('fs')
const createArtifact = require('./createArtifact')
const getZOSMigration = require('../getZOSMigration')

const outDir = './artifacts/'

function exportArtifacts(
    network,
    version
) {
    const { name } = require('../../../../zos.json')

    console.log(`Exporting: ${name}`)

    const { contracts, proxies } = getZOSMigration()
    const contractNames = Object.keys(contracts)

    contractNames.forEach((contractName) => {
        console.log(`Exporting artifact: ${contractName}.${network}.json`)

        const artifact = createArtifact(contractName, proxies[`${name}/${contractName}`][0].address)

        const filename = `${contractName}.${network.toLowerCase()}.json`

        /* eslint-disable-next-line security/detect-non-literal-fs-filename */
        fs.writeFileSync(`${outDir}${filename}`, JSON.stringify(artifact, null, 2))
    })

    /* eslint-disable-next-line no-console */
    console.log(name, version, network)
}

module.exports = exportArtifacts
