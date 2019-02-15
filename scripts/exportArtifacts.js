const fs = require('fs')
const glob = require('glob')
const pkg = require('../package.json')
const { generateFunctionSignaturesInABI } = require('./generateFunctionSignaturesInABI')
const buildDir = './build/contracts/'
const outDir = './artifacts/'

const network = process.env.NETWORK || 'development'
const version = `v${pkg.version}`

function getZOSMigration() {
    const zosFile = glob.sync('./zos.*.json', 'utf-8')[0]
    /* eslint-disable-next-line security/detect-non-literal-fs-filename */
    return JSON.parse(fs.readFileSync(zosFile, 'utf-8').toString())
}

function updateArtifacts(oldContractName, newContractName) {
    const { contracts } = getZOSMigration()

    if (!(oldContractName in contracts)) {
        throw new Error('Contract was not handled by zos.')
    }

    /* eslint-disable-next-line no-console */
    console.log(`Updating artifact: ${oldContractName} with the ABI of ${newContractName}`)

    const fileName = `${oldContractName}.${network.toLowerCase()}.json`

    /* eslint-disable-next-line security/detect-non-literal-fs-filename */
    const { address } = JSON.parse(fs.readFileSync(`${outDir}${fileName}`, 'utf-8').toString())

    const artifact = createArtifact(newContractName, address)

    /* eslint-disable-next-line security/detect-non-literal-fs-filename */
    fs.writeFileSync(`${outDir}${fileName}`, JSON.stringify(artifact, null, 2))
}

function createArtifact(contractName, address) {
    /* eslint-disable-next-line security/detect-non-literal-fs-filename */
    const contract = JSON.parse(fs.readFileSync(`${buildDir}${contractName}.json`, 'utf-8').toString())

    generateFunctionSignaturesInABI(contract.abi)

    const artifact = {
        abi: contract.abi,
        bytecode: contract.bytecode,
        address,
        version
    }

    return artifact
}

function exportArtifacts(projectName) {
    /* eslint-disable-next-line no-console */
    console.log(`Exporting: ${projectName}`)

    const { contracts, proxies } = getZOSMigration()

    const contractNames = Object.keys(contracts)

    contractNames.forEach((contractName) => {
        /* eslint-disable-next-line no-console */
        console.log(`Exporting artifact: ${contractName}`)

        const artifact = createArtifact(contractName, proxies[`${projectName}/${contractName}`][0].address)

        const filename = `${contractName}.${network.toLowerCase()}.json`

        /* eslint-disable-next-line security/detect-non-literal-fs-filename */
        fs.writeFileSync(`${outDir}${filename}`, JSON.stringify(artifact, null, 2))
    })

    /* eslint-disable-next-line no-console */
    console.log(projectName, version, network)
}

module.exports = {
    exportArtifacts,
    updateArtifacts
}
