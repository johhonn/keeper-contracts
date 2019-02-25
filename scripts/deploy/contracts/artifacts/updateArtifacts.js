const fs = require('fs')

const createArtifact = require('./createArtifact')
const getZOSMigration = require('../getZOSMigration')

const outDir = './artifacts/'
const network = process.env.NETWORK || 'development'

function updateArtifacts(
    oldContractName,
    newContractName,
    version
) {
    const { contracts } = getZOSMigration()

    if (!(oldContractName in contracts)) {
        throw new Error('Contract was not handled by zos.')
    }

    /* eslint-disable-next-line no-console */
    console.log(`Updating artifact: ${oldContractName} with the ABI of ${newContractName}`)

    const fileName = `${oldContractName}.${network.toLowerCase()}.json`

    /* eslint-disable-next-line security/detect-non-literal-fs-filename */
    const { address } = JSON.parse(fs.readFileSync(`${outDir}${fileName}`, 'utf-8').toString())

    const artifact = createArtifact(newContractName, address, version)

    /* eslint-disable-next-line security/detect-non-literal-fs-filename */
    fs.writeFileSync(`${outDir}${fileName}`, JSON.stringify(artifact, null, 2))
}

module.exports = updateArtifacts
